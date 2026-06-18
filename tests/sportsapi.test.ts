import assert from "node:assert/strict";
import { test } from "node:test";
import { mapApiMatches, mergeResults } from "../lib/sportsapi";
import type { MatchResult } from "../lib/results";

const apiMatch = (over: Record<string, unknown> = {}) => ({
  id: 537001,
  utcDate: "2026-06-15T19:00:00Z",
  stage: "GROUP_STAGE",
  homeTeam: { name: "Argentina", shortName: "Argentina" },
  awayTeam: { name: "Brazil", shortName: "Brazil" },
  score: { fullTime: { home: 1, away: 2 } },
  ...over,
});

test("mapApiMatches maps a finished match to MatchResult", () => {
  const out = mapApiMatches([apiMatch()]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0], {
    id: "537001",
    date: "2026-06-15",
    teamA: "Argentina",
    teamB: "Brazil",
    scoreA: 1,
    scoreB: 2,
    stage: "group stage",
  });
});

test("mapApiMatches drops matches without numeric scores", () => {
  const noScore = apiMatch({ score: { fullTime: { home: null, away: null } } });
  assert.equal(mapApiMatches([noScore]).length, 0);
});

test("mapApiMatches drops matches missing a team", () => {
  const noTeam = apiMatch({ awayTeam: {} });
  assert.equal(mapApiMatches([noTeam]).length, 0);
});

test("mapApiMatches tolerates an empty / missing list", () => {
  assert.deepEqual(mapApiMatches([]), []);
  assert.deepEqual(mapApiMatches(undefined as unknown as unknown[]), []);
});

test("mergeResults dedupes by id with live winning, sorted by date", () => {
  const stored: MatchResult[] = [
    { id: "A", date: "2026-06-20", teamA: "X", teamB: "Y", scoreA: 0, scoreB: 0 },
    { id: "B", date: "2026-06-10", teamA: "P", teamB: "Q", scoreA: 1, scoreB: 1 },
  ];
  const live: MatchResult[] = [
    // same id as stored "A" but the official score differs → live wins
    { id: "A", date: "2026-06-20", teamA: "X", teamB: "Y", scoreA: 3, scoreB: 1 },
    { id: "C", date: "2026-06-05", teamA: "M", teamB: "N", scoreA: 2, scoreB: 0 },
  ];
  const merged = mergeResults(stored, live);
  assert.equal(merged.length, 3); // A (deduped), B, C
  assert.deepEqual(merged.map((r) => r.id), ["C", "B", "A"]); // date asc
  assert.equal(merged.find((r) => r.id === "A")!.scoreA, 3); // live overwrote
});
