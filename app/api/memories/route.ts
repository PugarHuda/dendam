import { getMemoryStore, namespaceFor } from "@/lib/memory";

export const runtime = "nodejs";

// Public read of a user's grudge file — powers the "Buku Dendam" dossier
// where the memory is visible (a hackathon submission requirement).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || "anon";
  const store = getMemoryStore();
  const namespace = namespaceFor(handle);

  try {
    const memories = await store.list(namespace, 100);
    return Response.json({
      handle,
      backend: store.backend,
      count: memories.length,
      memories,
    });
  } catch (err) {
    console.error("[dendam] list failed:", err);
    return Response.json(
      { handle, backend: store.backend, count: 0, memories: [], error: "list_failed" },
      { status: 200 },
    );
  }
}
