import { getMemoryStore, memoryNetwork, namespaceFor } from "@/lib/memory";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";
import { listCached } from "@/lib/listcache";

export const runtime = "nodejs";
// list() fans out several relayer recalls; allow headroom on a slow relayer.
export const maxDuration = 60;

// Public read of a user's grudge file — powers the "The File" dossier
// where the memory is visible (a hackathon submission requirement).
export async function GET(req: Request) {
  // Generous (read endpoint, cached) but bounds enumeration/scraping.
  const rl = rateLimit("memories", clientIp(req), 80, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || "anon";
  const store = getMemoryStore();
  const namespace = namespaceFor(handle);

  try {
    const memories = await listCached(store, namespace, 100);
    return Response.json({
      handle,
      backend: store.backend,
      network: memoryNetwork(),
      count: memories.length,
      memories,
    });
  } catch (err) {
    console.error("[dendam] list failed:", err);
    return Response.json(
      {
        handle,
        backend: store.backend,
        network: memoryNetwork(),
        count: 0,
        memories: [],
        error: "list_failed",
      },
      { status: 200 },
    );
  }
}
