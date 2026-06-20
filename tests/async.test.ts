import assert from "node:assert/strict";
import { test } from "node:test";
import { mapLimit } from "../lib/async";

test("mapLimit preserves input order regardless of completion order", async () => {
  const items = [40, 10, 30, 0, 20];
  const out = await mapLimit(items, 2, async (n) => {
    await new Promise((r) => setTimeout(r, n));
    return n * 2;
  });
  assert.deepEqual(out, [80, 20, 60, 0, 40]);
});

test("mapLimit never exceeds the concurrency limit", async () => {
  let active = 0;
  let peak = 0;
  const items = Array.from({ length: 20 }, (_, i) => i);
  await mapLimit(items, 4, async () => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 5));
    active--;
  });
  assert.ok(peak <= 4, `peak concurrency ${peak} exceeded limit 4`);
});

test("mapLimit passes the index and handles an empty list", async () => {
  const idx = await mapLimit(["a", "b", "c"], 5, async (_v, i) => i);
  assert.deepEqual(idx, [0, 1, 2]);
  assert.deepEqual(await mapLimit([], 3, async () => 1), []);
});

test("mapLimit rejects with the first error and leaves NO unhandled rejection", async () => {
  const unhandled: unknown[] = [];
  const onUnhandled = (e: unknown) => unhandled.push(e);
  process.on("unhandledRejection", onUnhandled);
  try {
    // Two items reject at different times. Under a naive Promise.all the later
    // rejection (after the first already settled the race) would float and
    // crash the process — this guards that regression.
    const run = mapLimit([10, 30, 5, 20], 4, async (n) => {
      await new Promise((r) => setTimeout(r, n));
      if (n === 10 || n === 30) throw new Error(`boom ${n}`);
      return n;
    });
    await assert.rejects(run, /boom/);
    await new Promise((r) => setTimeout(r, 60)); // let any float surface
    assert.equal(unhandled.length, 0, `unexpected unhandled rejections: ${unhandled.length}`);
  } finally {
    process.off("unhandledRejection", onUnhandled);
  }
});
