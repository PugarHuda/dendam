import assert from "node:assert/strict";
import { test } from "node:test";
import { rateLimit } from "../lib/ratelimit";

test("rateLimit allows up to the limit, then blocks until the window resets", () => {
  const t0 = 1_000_000;
  assert.equal(rateLimit("t-reset", "k", 3, 1000, t0).ok, true);
  assert.equal(rateLimit("t-reset", "k", 3, 1000, t0 + 1).ok, true);
  assert.equal(rateLimit("t-reset", "k", 3, 1000, t0 + 2).ok, true);

  const blocked = rateLimit("t-reset", "k", 3, 1000, t0 + 3);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter >= 0 && blocked.retryAfter <= 1);

  // once the window elapses, the counter resets
  assert.equal(rateLimit("t-reset", "k", 3, 1000, t0 + 1001).ok, true);
});

test("rateLimit isolates different keys and buckets", () => {
  const t = 5_000_000;
  assert.equal(rateLimit("t-iso-x", "a", 1, 1000, t).ok, true);
  assert.equal(rateLimit("t-iso-x", "a", 1, 1000, t).ok, false); // same key exhausted
  assert.equal(rateLimit("t-iso-x", "b", 1, 1000, t).ok, true); // different key fresh
  assert.equal(rateLimit("t-iso-y", "a", 1, 1000, t).ok, true); // different bucket fresh
});

test("rateLimit reports remaining budget", () => {
  const t = 9_000_000;
  assert.equal(rateLimit("t-rem", "k", 2, 1000, t).remaining, 1);
  assert.equal(rateLimit("t-rem", "k", 2, 1000, t).remaining, 0);
  assert.equal(rateLimit("t-rem", "k", 2, 1000, t).remaining, 0); // never negative
});
