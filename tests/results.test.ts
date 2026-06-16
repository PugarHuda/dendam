import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addResults,
  formatResult,
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
  assert.match(s, /Brasil menang/);
  assert.match(formatResult({ ...base, scoreA: 1, scoreB: 1 }), /seri/);
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
