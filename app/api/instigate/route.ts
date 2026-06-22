import { instigateForHandles } from "@/lib/instigator";
import { getMemoryStore } from "@/lib/memory";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cap the group size: each handle fans out a list() (~5 relayer recalls), so
// an unbounded list would let one request stampede the Walrus relayer.
const MAX_HANDLES = 12;

// POST { handles: string[] } — Dendam the instigator stirs beef between the
// listed members based on what each has actually said/predicted.
export async function POST(req: Request) {
  const rl = rateLimit("instigate", clientIp(req), 15, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { handles } = (await req.json().catch(() => ({}))) as {
    handles?: string[];
  };
  const list = (Array.isArray(handles) ? handles : [])
    .filter((h) => h && h.trim())
    .slice(0, MAX_HANDLES);
  if (list.length < 2) {
    return Response.json({ error: "need_at_least_2_handles" }, { status: 400 });
  }

  try {
    const result = await instigateForHandles(list);
    return Response.json({ backend: getMemoryStore().backend, ...result });
  } catch (err) {
    console.error("[dendam] instigate failed:", err);
    return Response.json({ error: "instigate_failed" }, { status: 500 });
  }
}
