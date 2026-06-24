import { streamText, type CoreMessage } from "ai";
import { dendamModel } from "@/lib/model";
import { COLD_SYSTEM } from "@/lib/coldstart";
import { extractGrudges } from "@/lib/grudge";
import { getMemoryStore, memoryNetwork, namespaceFor } from "@/lib/memory";
import { DENDAM_SYSTEM, renderMemoryBlock } from "@/lib/persona";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";
import { sessionAddress, guestAllowed } from "@/lib/auth";
import { withTimeout } from "@/lib/timeout";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Each chat turn calls the LLM, so cap per-IP to deter credit-burning spam.
  const rl = rateLimit("chat", clientIp(req), 20, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { messages, handle } = (await req.json().catch(() => ({}))) as {
    messages?: CoreMessage[];
    handle?: string;
  };
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "no_messages" }, { status: 400 });
  }

  // Identity: a verified wallet session always wins (its File can't be spoofed).
  // Otherwise, if guests are allowed, fall back to the client nickname; if a
  // wallet is required, reject.
  const session = sessionAddress(req);
  const identity =
    session ??
    (guestAllowed() ? (handle?.trim().replace(/^@/, "") || "anon") : null);
  if (!identity) {
    return Response.json({ error: "auth_required" }, { status: 401 });
  }

  const store = getMemoryStore();
  const namespace = namespaceFor(identity);

  // The latest user turn is the recall query.
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const query =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : JSON.stringify(lastUser?.content ?? "");

  // 1) RECALL — pull what Dendam remembers about this user from Walrus.
  // Skip on an empty query (e.g. a non-text first turn) to avoid a useless call.
  // Time-boxed: if Walrus is slow, don't hang the whole reply on "digging up
  // your file…" — fall back to a cold-start (still streams) after the cap.
  let recalled: Awaited<ReturnType<typeof store.recall>> = [];
  if (query.trim()) {
    try {
      recalled = await withTimeout(store.recall(namespace, query, 8), 7000, "recall");
    } catch (err) {
      console.error("[dendam] recall failed/timeout:", err);
    }
  }

  const headers = {
    "x-dendam-backend": store.backend,
    "x-dendam-network": memoryNetwork(),
    // How many memories grounded this reply — surfaced in the UI so the
    // recall→respond loop is visible (0 = cold start, first encounter).
    "x-dendam-recalled": String(recalled.length),
    // The actual recalled lines (compact, header-safe) so the UI can reveal
    // exactly which memories Dendam used. Headers are latin1, so URL-encode.
    "x-dendam-recalled-items": encodeURIComponent(
      JSON.stringify(
        recalled.slice(0, 8).map((m) => ({
          t: m.text.slice(0, 140),
          k: m.kind,
          w: !!m.wasWrong,
        })),
      ),
    ),
  };

  // Helper: persist durable grudges from an exchange (best-effort).
  const remember = async (assistantText: string) => {
    try {
      const grudges = await extractGrudges(query, assistantText);
      for (const g of grudges) await store.remember(namespace, g);
    } catch (err) {
      console.error("[dendam] remember failed:", err);
    }
  };

  // COLD START — no memory to ground on. The fabrication risk (inventing a
  // fake past) is contained by COLD_SYSTEM's hard constraint, so we stream
  // here too: time-to-first-token matters most on a user's very first reply,
  // and a blocking generate felt like "not streaming". (mentionsFabricatedPast
  // in lib/coldstart stays available as a guard for weak/non-Claude models.)
  const system =
    recalled.length === 0
      ? COLD_SYSTEM
      : `${DENDAM_SYSTEM}\n\n${renderMemoryBlock(recalled)}`;

  // RESPOND — stream the reply. 3) REMEMBER: distil it into durable grudges.
  const result = streamText({
    model: dendamModel,
    system,
    messages,
    temperature: recalled.length === 0 ? 0.7 : 0.85,
    onFinish: ({ text }) => remember(text),
  });

  return result.toDataStreamResponse({ headers });
}
