import { getMemoryStore, namespaceFor } from "@/lib/memory";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { handle, match, prediction } — join a match room by dropping a
// prediction. The prediction is stored on Walrus (real memory), so it also
// shows up in your File and Dendam can throw it back later.
export async function POST(req: Request) {
  const rl = rateLimit("room", clientIp(req), 20, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { handle, match, prediction } = (await req.json().catch(() => ({}))) as {
    handle?: string;
    match?: string;
    prediction?: string;
  };
  const pred = (prediction ?? "").trim();
  if (!handle?.trim() || !pred) {
    return Response.json({ error: "need_handle_and_prediction" }, { status: 400 });
  }

  const store = getMemoryStore();
  try {
    await store.remember(namespaceFor(handle), {
      text: `Match-room call${match ? ` (${match})` : ""}: ${pred.slice(0, 200)}`,
      kind: "prediction",
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[dendam] room join failed:", err);
    return Response.json({ error: "join_failed" }, { status: 500 });
  }
}
