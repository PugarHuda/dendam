import { generateText } from "ai";
import { dendamModel } from "@/lib/model";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

// POST { teamA, teamB, messages: [{handle,text}] } — Dendam jumps into a match
// room and reacts to the latest message, in character. No button: the client
// calls this automatically after each post so Dendam feels like a participant.
export async function POST(req: Request) {
  const rl = rateLimit("roomdendam", clientIp(req), 40, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { teamA, teamB, messages } = (await req.json().catch(() => ({}))) as {
    teamA?: string;
    teamB?: string;
    messages?: { handle: string; text: string }[];
  };
  const recent = Array.isArray(messages)
    ? messages.slice(-8).filter((m) => m.handle?.toLowerCase() !== "dendam")
    : [];
  if (recent.length === 0) return Response.json({ line: "" });
  const convo = recent.map((m) => `@${m.handle}: ${m.text}`).join("\n");

  try {
    const { text } = await generateText({
      model: dendamModel,
      system:
        `You are Dendam — a vengeful, witty football rival lurking in a World Cup 2026 chat room for ${teamA ?? "?"} vs ${teamB ?? "?"}. ` +
        "React to the LAST message with ONE short, spicy, funny line (max 2 sentences). Tag the person with @their-handle. " +
        "Stir the pot about their take or prediction — never personal/identity attacks, no hate. " +
        "Mirror the room's language. Don't greet or explain — just jump in like you've been here the whole time.",
      prompt: `Chat so far:\n${convo}\n\nDrop ONE in-character line reacting to the LAST message.`,
      temperature: 0.9,
      maxTokens: 90,
    });
    return Response.json({ line: (text ?? "").trim() });
  } catch {
    return Response.json({ line: "" });
  }
}
