import { getMemoryStore, namespaceFor } from "@/lib/memory";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";
import { sessionAddress } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { match, prediction } — join a match room by dropping a prediction.
// Requires a connected + signed-in wallet; the call lands in that wallet's File
// on Walrus, so Dendam can throw it back later.
export async function POST(req: Request) {
  const rl = rateLimit("room", clientIp(req), 20, 60_000);
  if (!rl.ok) return tooMany(rl);

  const addr = sessionAddress(req);
  if (!addr) return Response.json({ error: "auth_required" }, { status: 401 });

  const { match, prediction } = (await req.json().catch(() => ({}))) as {
    match?: string;
    prediction?: string;
  };
  const pred = (prediction ?? "").trim();
  if (!pred) {
    return Response.json({ error: "need_prediction" }, { status: 400 });
  }

  const store = getMemoryStore();
  try {
    await store.remember(namespaceFor(addr), {
      text: `Match-room call${match ? ` (${match})` : ""}: ${pred.slice(0, 200)}`,
      kind: "prediction",
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[dendam] room join failed:", err);
    return Response.json({ error: "join_failed" }, { status: 500 });
  }
}
