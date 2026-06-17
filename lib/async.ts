// Small async helpers shared across the API routes and memory layer.

// Run an async fn over items with bounded concurrency, preserving input order.
// Keeps us well under Vercel's 60s function limit when fanning out N calls to
// the LLM or the Walrus relayer, without hammering a beta backend all at once.
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    },
  );
  await Promise.all(workers);
  return out;
}
