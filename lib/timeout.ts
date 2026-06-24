// Race a promise against a timeout. On timeout the returned promise rejects so
// callers can fall back (e.g. proceed with no recalled memory) instead of
// hanging the whole request when Walrus is slow.
export function withTimeout<T>(p: Promise<T>, ms: number, label = "op"): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms),
    ),
  ]);
}
