import { getMemoryStore, memoryNetwork, namespaceFor } from "@/lib/memory";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { handle, query } — run a real semantic recall() against a handle's
// memory and return the top matches. Powers the "Ask the file" box on The
// File, which demonstrates Walrus Memory's vector search on demand (not the
// keyword/list approximation).
export async function POST(req: Request) {
  const rl = rateLimit("recall", clientIp(req), 30, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { handle, query } = (await req.json().catch(() => ({}))) as {
    handle?: string;
    query?: string;
  };
  const q = (query ?? "").trim();
  if (!q) return Response.json({ error: "no_query" }, { status: 400 });

  const store = getMemoryStore();
  try {
    const memories = await store.recall(namespaceFor(handle || "anon"), q, 6);
    return Response.json({
      backend: store.backend,
      network: memoryNetwork(),
      query: q,
      count: memories.length,
      memories,
    });
  } catch (err) {
    console.error("[dendam] recall failed:", err);
    return Response.json({ error: "recall_failed" }, { status: 500 });
  }
}
