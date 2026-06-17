import assert from "node:assert/strict";
import { test } from "node:test";
import { mentionsFabricatedPast } from "../lib/coldstart";

test("flags fabricated-past phrasing (multilingual)", () => {
  for (const s of [
    "Bold, like when you predicted Brazil would win.",
    "You said Argentina was unbeatable.",
    "Last time you were dead wrong.",
    "Kemarin lo bilang Brasil juara.",
    "Como cuando dijiste que España ganaría.",
    "Predijiste mal otra vez.",
    "Dulu lo ngotot Argentina menang.",
  ]) {
    assert.equal(mentionsFabricatedPast(s), true, s);
  }
});

test("does NOT flag clean cold-open / future framing", () => {
  for (const s of [
    "First time in my ring? Drop a prediction and I'll remember it.",
    "I've got nothing on you yet — make a bold call.",
    "If you predict Brazil wins, I'll hold you to it.",
    "Give me a score and a winner.",
    "Primera vez? Dame una predicción y la recordaré.",
  ]) {
    assert.equal(mentionsFabricatedPast(s), false, s);
  }
});
