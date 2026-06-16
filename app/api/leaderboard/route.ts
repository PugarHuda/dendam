import { leaderboardForHandles } from "@/lib/leaderboard";
import { getMemoryStore } from "@/lib/memory";

export const runtime = "nodejs";

// POST { handles: string[] } — Hall of Shame standings for a group,
// computed from stored memories (no LLM).
export async function POST(req: Request) {
  const { handles } = (await req.json().catch(() => ({}))) as {
    handles?: string[];
  };
  const list = Array.isArray(handles) ? handles : [];
  if (list.filter((h) => h && h.trim()).length < 1) {
    return Response.json({ error: "need_handles" }, { status: 400 });
  }
  const rows = await leaderboardForHandles(list);
  return Response.json({ backend: getMemoryStore().backend, rows });
}
