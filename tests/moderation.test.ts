import assert from "node:assert/strict";
import { test } from "node:test";
import { isAbusive } from "../lib/moderation";

test("isAbusive flags obvious slurs (incl. simple leet swaps)", () => {
  assert.equal(isAbusive("you absolute ret4rd"), true);
  assert.equal(isAbusive("total f4ggot move"), true);
});

test("isAbusive does NOT flag innocent words (no Scunthorpe problem)", () => {
  for (const s of [
    "Scunthorpe United are top of the table",
    "Spain love their spice",
    "wrapped up like a cocoon",
    "stop sniggering at my pick",
    "you know nothing about football",
    "Argentina will collapse, Brazil walk it",
  ]) {
    assert.equal(isAbusive(s), false, s);
  }
});

test("isAbusive handles empty / undefined", () => {
  assert.equal(isAbusive(""), false);
  assert.equal(isAbusive(undefined), false);
  assert.equal(isAbusive(null), false);
});
