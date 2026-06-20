import {
  createDataStreamResponse,
  formatDataStreamPart,
  streamText,
  type CoreMessage,
} from "ai";
import { after } from "next/server";
import { dendamModel } from "@/lib/model";
import { coldStartReply } from "@/lib/coldstart";
import { extractGrudges } from "@/lib/grudge";
import { getMemoryStore, memoryNetwork, namespaceFor } from "@/lib/memory";
import { DENDAM_SYSTEM, renderMemoryBlock } from "@/lib/persona";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

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

  const store = getMemoryStore();
  const namespace = namespaceFor(handle || "anon");

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
  let recalled: Awaited<ReturnType<typeof store.recall>> = [];
  if (query.trim()) {
    try {
      recalled = await store.recall(namespace, query, 8);
    } catch (err) {
      console.error("[dendam] recall failed:", err);
    }
  }

  const headers = {
    "x-dendam-backend": store.backend,
    "x-dendam-network": memoryNetwork(),
    // How many memories grounded this reply — surfaced in the UI so the
    // recall→respond loop is visible (0 = cold start, first encounter).
    "x-dendam-recalled": String(recalled.length),
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

  // COLD START — no memory to ground on. A weak free model can fabricate a
  // fake past here, so we use a deterministic guard (generate → check → retry
  // → safe fallback) instead of streaming and hoping the model obeys.
  if (recalled.length === 0) {
    const text = await coldStartReply(messages);
    // Persist grudges AFTER the response is flushed — extraction + the Walrus
    // write must not delay the user's day-1 reply (and must not risk the 60s
    // function limit on the critical cold-start path).
    after(() => remember(text));
    return createDataStreamResponse({
      headers,
      execute(writer) {
        writer.write(formatDataStreamPart("text", text));
      },
    });
  }

  const system = `${DENDAM_SYSTEM}\n\n${renderMemoryBlock(recalled)}`;

  // 2) RESPOND — armed with real memories, streaming is safe (referencing the
  // recalled past is the goal, not fabrication).
  const result = streamText({
    model: dendamModel,
    system,
    messages,
    temperature: 0.85,
    // 3) REMEMBER — distil this exchange into durable grudges for next time.
    onFinish: ({ text }) => remember(text),
  });

  return result.toDataStreamResponse({ headers });
}
