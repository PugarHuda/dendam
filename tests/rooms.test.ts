import assert from "node:assert/strict";
import { test } from "node:test";
import { getRoom, resolveRoom } from "../lib/rooms";

test("resolveRoom scores by the team a player backed (bundled seed: Brazil beat Argentina)", async () => {
  delete process.env.DENDAM_SEED_RESULTS;
  delete process.env.FOOTBALL_DATA_TOKEN;
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-rooms-${Date.now()}`;
  const room = getRoom("WC2026-BRA-ARG-QF");
  assert.ok(room);
  const r = await resolveRoom(room);
  assert.equal(r.winnerTeam, "Brazil");
  // only the players who backed Brazil win — not everyone whose text says "Brazil"
  assert.deepEqual(r.winners.slice().sort(), ["kontiki", "ta"]);
});

test("resolveRoom: an unplayed match is open with no winners", async () => {
  delete process.env.FOOTBALL_DATA_TOKEN;
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-rooms2-${Date.now()}`;
  const room = getRoom("WC2026-FRA-ESP-SF");
  assert.ok(room);
  const r = await resolveRoom(room);
  assert.equal(r.result, null);
  assert.deepEqual(r.winners, []);
});
