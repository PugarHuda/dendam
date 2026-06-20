import assert from "node:assert/strict";
import { test } from "node:test";
import { biggerFraud, emptyStats, statsForHandle } from "../lib/stats";
import { getMemoryStore, namespaceFor } from "../lib/memory";

// ── biggerFraud (pure head-to-head comparison) ──────────────
const mk = (handle: string, over: Partial<ReturnType<typeof emptyStats>>) => ({
  ...emptyStats(handle),
  ...over,
});

test("biggerFraud: more wrong calls is the bigger fraud", () => {
  assert.equal(biggerFraud(mk("a", { wrong: 3 }), mk("b", { wrong: 1 }))?.handle, "a");
});

test("biggerFraud: tie on wrong → worse accuracy is the bigger fraud", () => {
  const a = mk("a", { wrong: 2, accuracy: 0.2 });
  const b = mk("b", { wrong: 2, accuracy: 0.8 });
  assert.equal(biggerFraud(a, b)?.handle, "a");
});

test("biggerFraud: an unresolved file (null accuracy) counts as perfect, never loses on accuracy", () => {
  const a = mk("a", { wrong: 0, accuracy: null }); // 1.0
  const b = mk("b", { wrong: 0, accuracy: 0.5 });
  assert.equal(biggerFraud(a, b)?.handle, "b");
});

test("biggerFraud: tie on wrong + accuracy → more trash talk is the bigger fraud", () => {
  const a = mk("a", { wrong: 1, accuracy: 0.5, insults: 5 });
  const b = mk("b", { wrong: 1, accuracy: 0.5, insults: 1 });
  assert.equal(biggerFraud(a, b)?.handle, "a");
});

test("biggerFraud: a dead heat returns null", () => {
  const a = mk("a", { wrong: 1, accuracy: 0.5, insults: 2 });
  const b = mk("b", { wrong: 1, accuracy: 0.5, insults: 2 });
  assert.equal(biggerFraud(a, b), null);
});

// Drive the real (local) store end-to-end, like the leaderboard tests.
test("statsForHandle tallies kinds, accuracy, and features the busted prediction", async () => {
  process.env.DENDAM_MEMORY_BACKEND = "local";
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-stats-${Date.now()}`;
  const store = getMemoryStore();
  const ns = namespaceFor("hud");

  await store.remember(ns, { text: "Argentina wins it all", kind: "prediction" });
  await store.remember(ns, { text: "Mbappe outscores Messi", kind: "prediction" });
  await store.remember(ns, { text: "you dumb bot", kind: "insult" });
  await store.remember(ns, { text: "Verdict: Argentina out — told you so", kind: "result", wasWrong: true });
  await store.remember(ns, { text: "Verdict: Mbappe top scorer — fine", kind: "result", wasWrong: false });

  const s = await statsForHandle("hud");
  assert.equal(s.total, 5);
  assert.equal(s.predictions, 2);
  assert.equal(s.insults, 1);
  assert.equal(s.wrong, 1);
  assert.equal(s.correct, 1);
  assert.equal(s.accuracy, 0.5);
  // featured line: a busted prediction (wrong verdict) outranks everything.
  assert.match(s.topLine ?? "", /Argentina out/);
});

test("statsForHandle: empty handle → zeros, null accuracy, null topLine", async () => {
  process.env.DENDAM_MEMORY_BACKEND = "local";
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-stats2-${Date.now()}`;
  const s = await statsForHandle("nobody-here");
  assert.equal(s.total, 0);
  assert.equal(s.predictions, 0);
  assert.equal(s.accuracy, null);
  assert.equal(s.topLine, null);
});

test("statsForHandle falls back to an insult for topLine when nothing is busted", async () => {
  process.env.DENDAM_MEMORY_BACKEND = "local";
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-stats3-${Date.now()}`;
  const store = getMemoryStore();
  const ns = namespaceFor("rookie");
  await store.remember(ns, { text: "Spain are boring", kind: "prediction" });
  await store.remember(ns, { text: "you know nothing about football", kind: "insult" });

  const s = await statsForHandle("rookie");
  assert.equal(s.accuracy, null); // no verdicts resolved
  assert.match(s.topLine ?? "", /you know nothing/); // insult > raw prediction
});
