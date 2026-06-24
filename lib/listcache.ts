import type { MemoryStore } from "./memory/types";

// Short-TTL cache for store.list() — the expensive Walrus read behind The File,
// the leaderboard, share pages, and room polling. The MemWal delegate key is
// capped at ~30 weighted requests/min for the WHOLE app, so without this a few
// concurrent page loads (or a couple of open rooms polling) can exhaust the
// budget and make reads come back empty. 12s is well under Walrus's own
// write→read propagation (~15–40s), so caching costs no real freshness.
type Rec = Awaited<ReturnType<MemoryStore["list"]>>;

// Personal Files / leaderboard handles change slowly → cache hard. Room threads
// need to feel live → short TTL (still ≥ Walrus propagation, which dominates).
const ROOM_TTL = 8_000;
const FILE_TTL = 30_000;
const cache = new Map<string, { exp: number; val: Rec }>();
const inflight = new Map<string, Promise<Rec>>();

export async function listCached(store: MemoryStore, namespace: string, limit = 100): Promise<Rec> {
  const key = `${namespace}#${limit}`;
  const now = Date.now();

  const hit = cache.get(key);
  if (hit && hit.exp > now) return hit.val;

  // Collapse concurrent reads of the same namespace into one Walrus call.
  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      try {
        const val = await store.list(namespace, limit);
        // Only cache a real result. An empty array can mean "rate-limited /
        // not propagated yet" as easily as "genuinely empty", so caching it
        // would pin the page blank — let the next read retry instead.
        if (val.length > 0) {
          const ttl = namespace.includes("room-") ? ROOM_TTL : FILE_TTL;
          cache.set(key, { exp: Date.now() + ttl, val });
        }
        return val;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
  }
  return p;
}
