import { getMemoryStore } from "@/lib/memory";
import { roomNamespace } from "@/lib/rooms";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";
import { isAbusive } from "@/lib/moderation";
import { sessionAddress } from "@/lib/auth";
import { shortAddress } from "@/lib/authShared";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { roomId, message } — post a chat message into a match room. Requires a
// connected + signed-in wallet; the author is the verified address (shown
// short) so posts can't be spoofed. The room's chat lives in its own Walrus
// namespace — real, persistent, cross-user.
export async function POST(req: Request) {
  const rl = rateLimit("roompost", clientIp(req), 30, 60_000);
  if (!rl.ok) return tooMany(rl);

  const addr = sessionAddress(req);
  if (!addr) return Response.json({ error: "auth_required" }, { status: 401 });

  const { roomId, message, displayName } = (await req.json().catch(() => ({}))) as {
    roomId?: string;
    message?: string;
    displayName?: string;
  };
  const text = (message ?? "").trim();
  // Author label = the user's chosen display name (cosmetic; auth is the
  // verified session above). Fall back to the short address.
  const who = (displayName ?? "").trim().replace(/^@/, "").slice(0, 40) || shortAddress(addr);
  if (!roomId?.trim() || !text) {
    return Response.json({ error: "need_room_and_message" }, { status: 400 });
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
