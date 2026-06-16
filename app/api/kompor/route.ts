import { komporForHandles } from "@/lib/kompor";
import { getMemoryStore } from "@/lib/memory";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { handles: string[] } — Dendam the tukang kompor stirs beef between
// the listed members based on what each has actually said/predicted.
export async function POST(req: Request) {
  const { handles } = (await req.json().catch(() => ({}))) as {
    handles?: string[];
  };
  const list = Array.isArray(handles) ? handles : [];
  if (list.filter((h) => h && h.trim()).length < 2) {
    return Response.json(
      { error: "need_at_least_2_handles" },
      { status: 400 },
    );
  }

  try {
    const result = await komporForHandles(list);
    return Response.json({ backend: getMemoryStore().backend, ...result });
  } catch (err) {
    console.error("[dendam] kompor failed:", err);
    return Response.json({ error: "kompor_failed" }, { status: 500 });
  }
}
