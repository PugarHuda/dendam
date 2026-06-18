import assert from "node:assert/strict";
import { test } from "node:test";
import { leaderboardForHandles } from "../lib/leaderboard";
import { getMemoryStore, namespaceFor } from "../lib/memory";

// Drive the real (local) store end-to-end: seed each handle's memories, then
// assert the Hall of Shame math + ordering. Forces the local backend.
test("leaderboard ranks most-wrong first and computes accuracy", async () => {
  process.env.DENDAM_MEMORY_BACKEND = "local";
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-lb-${Date.now()}`;
  const store = getMemoryStore();
  assert.equal(store.backend, "local");

  // @loser: 2 predictions, both resolved wrong, 1 insult → accuracy 0
  await store.remember(namespaceFor("loser"), { text: "Argentina wins", kind: "prediction" });
  await store.remember(namespaceFor("loser"), { text: "Brazil out in group", kind: "prediction" });
  await store.remember(namespaceFor("loser"), { text: "verdict 1", kind: "result", wasWrong: true });
  await store.remember(namespaceFor("loser"), { text: "verdict 2", kind: "result", wasWrong: true });
  await store.remember(namespaceFor("loser"), { text: "you dumb bot", kind: "insult" });

  // @sharp: 1 prediction resolved correct → accuracy 1, 0 wrong
  await store.remember(namespaceFor("sharp"), { text: "France semis", kind: "prediction" });
  await store.remember(namespaceFor("sharp"), { text: "verdict ok", kind: "result", wasWrong: false });

  const rows = await leaderboardForHandles(["sharp", "loser"]);
  assert.equal(rows.length, 2);
  // Hall of Shame: most wrong first → loser leads despite input order.
  assert.equal(rows[0].handle, "loser");
  assert.equal(rows[0].wrong, 2);
  assert.equal(rows[0].insults, 1);
  assert.equal(rows[0].accuracy, 0);
  assert.equal(rows[1].handle, "sharp");
  assert.equal(rows[1].wrong, 0);
  assert.equal(rows[1].correct, 1);
  assert.equal(rows[1].accuracy, 1);
});

test("leaderboard dedupes handles and yields null accuracy when nothing resolved", async () => {
  process.env.DENDAM_MEMORY_BACKEND = "local";
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-lb2-${Date.now()}`;
  const store = getMemoryStore();
  await store.remember(namespaceFor("rookie"), { text: "Spain wins", kind: "prediction" });

  const rows = await leaderboardForHandles(["rookie", "rookie", "  "]);
  assert.equal(rows.length, 1); // deduped + blank dropped
  assert.equal(rows[0].predictions, 1);
  assert.equal(rows[0].accuracy, null); // no verdicts yet
});
