import { getMemoryStore } from "@/lib/memory";
import { roomNamespace } from "@/lib/rooms";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";
import { isAbusive } from "@/lib/moderation";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { roomId, handle, message } — post a chat message into a match room.
// The room's chat lives in its own Walrus namespace, so posts are real,
// persistent, and shared across everyone who opens the room — async (refresh
// to see new posts), but genuinely cross-user on Walrus.
export async function POST(req: Request) {
  const rl = rateLimit("roompost", clientIp(req), 30, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { roomId, handle, message } = (await req.json().catch(() => ({}))) as {
    roomId?: string;
    handle?: string;
    message?: string;
  };
  const text = (message ?? "").trim();
  const who = (handle ?? "").trim().replace(/^@/, "");
  if (!roomId?.trim() || !who || !text) {
    return Response.json({ error: "need_room_handle_message" }, { status: 400 });
  }
  // Basic guard: this is a public, persistent room chat (no delete API).
  if (isAbusive(text)) {
    return Response.json({ error: "keep_it_clean" }, { status: 400 });
  }

  const store = getMemoryStore();
  try {
    // Store the message text with the author in `team` so we can render the
    // thread without a brittle in-text delimiter.
    await store.remember(roomNamespace(roomId), {
      text: text.slice(0, 280),
      kind: "fact",
      team: who.slice(0, 40),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[dendam] room post failed:", err);
    return Response.json({ error: "post_failed" }, { status: 500 });
  }
}
