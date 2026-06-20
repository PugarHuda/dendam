// Small async helpers shared across the API routes and memory layer.

// Run an async fn over items with bounded concurrency, preserving input order.
// Keeps us well under Vercel's 60s function limit when fanning out N calls to
// the LLM or the Walrus relayer, without hammering a beta backend all at once.
// On the first failure it still rejects (with that error), but it does so
// SAFELY: each worker catches its own error and stops, so the remaining
// in-flight workers are always awaited. A naive `await Promise.all(workers)`
// rejects on the first worker while its siblings are still pending — if one of
// those then rejects, it becomes an UNHANDLED promise rejection, which crashes
// the serverless invocation (observed live as an empty-body 500 from the
// leaderboard route when the Walrus relayer made several concurrent recalls
// fail at once). Catching inside each worker removes that hazard.
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  let failed = false;
  let firstError: unknown;
  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      // Stop pulling new work once any item has failed — we're going to throw
      // anyway, so don't keep hammering a struggling backend.
      while (next < items.length && !failed) {
        const i = next++;
        try {
          out[i] = await fn(items[i], i);
        } catch (err) {
          if (!failed) {
            failed = true;
            firstError = err;
          }
          return; // this worker is done; siblings finish their in-flight call
        }
      }
    },
  );
  await Promise.all(workers); // workers never reject → no unhandled rejection
  if (failed) throw firstError;
  return out;
}
