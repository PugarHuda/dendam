import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addResults,
  formatResult,
  isValidResult,
  listResults,
  winnerOf,
  type MatchResult,
} from "../lib/results";

const base: MatchResult = {
  id: "T",
  date: "2026-06-15",
  teamA: "Argentina",
  teamB: "Brasil",
  scoreA: 1,
  scoreB: 2,
};

test("winnerOf picks the higher score", () => {
  assert.equal(winnerOf(base), "Brasil");
  assert.equal(winnerOf({ ...base, scoreA: 3, scoreB: 0 }), "Argentina");
});

test("winnerOf returns draw on equal scores", () => {
  assert.equal(winnerOf({ ...base, scoreA: 1, scoreB: 1 }), "draw");
});

test("formatResult includes both teams and the winner", () => {
  const s = formatResult(base);
  assert.match(s, /Argentina 1-2 Brasil/);
  assert.match(s, /Brasil won/);
  assert.match(formatResult({ ...base, scoreA: 1, scoreB: 1 }), /draw/);
});

test("addResults upserts by id (no duplicates)", async () => {
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-results-${Date.now()}`;
  await addResults([base]);
  await addResults([{ ...base, scoreA: 5, scoreB: 0 }]); // same id, new score
  const all = await listResults();
  assert.equal(all.length, 1);
  assert.equal(all[0].scoreA, 5);
  assert.equal(winnerOf(all[0]), "Argentina");
});

test("isValidResult rejects malformed rows", () => {
  assert.equal(isValidResult(base), true);
  assert.equal(isValidResult({ ...base, id: "" }), false); // empty upsert key
  assert.equal(isValidResult({ ...base, date: undefined }), false); // breaks sort
  assert.equal(isValidResult({ ...base, scoreA: "1" }), false); // non-numeric score
  assert.equal(isValidResult({ ...base, teamA: "" }), false);
  assert.equal(isValidResult(null), false);
});

test("addResults drops invalid rows and reports -1 when none valid", async () => {
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-results-valid-${Date.now()}`;
  // A mix: one good row, two junk rows → only the good one is written.
  const bad = { id: "", date: "x" } as unknown as MatchResult;
  const total = await addResults([base, bad, { ...base, id: undefined } as unknown as MatchResult]);
  assert.equal(total, 1);
  const all = await listResults();
  assert.equal(all.length, 1);
  // All-invalid batch returns -1 and writes nothing new.
  assert.equal(await addResults([bad]), -1);
  assert.equal((await listResults()).length, 1);
});
