import assert from "node:assert/strict";
import { test } from "node:test";
import { normalize } from "../lib/memory/memwal";
import { serializeMemory } from "../lib/memory/types";

test("normalize handles an array of plain strings", () => {
  const out = normalize(["satu", "dua"], 10);
  assert.equal(out.length, 2);
  assert.equal(out[0].text, "satu");
});

test("normalize handles { memories: [{ text }] } shape", () => {
  const out = normalize({ memories: [{ text: "halo", id: "m1" }] }, 10);
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "halo");
  assert.equal(out[0].id, "m1");
});

test("normalize handles { results } and { items } and { data } shapes", () => {
  assert.equal(normalize({ results: [{ content: "a" }] }, 10).length, 1);
  assert.equal(normalize({ items: [{ memory: "b" }] }, 10).length, 1);
  assert.equal(normalize({ data: ["c"] }, 10).length, 1);
});

test("normalize parses embedded dendam metadata", () => {
  const raw = serializeMemory({
    text: "User mengejek Brasil",
    kind: "insult",
    team: "Brasil",
  });
  const out = normalize([{ text: raw }], 10);
  assert.equal(out[0].kind, "insult");
  assert.equal(out[0].team, "Brasil");
  assert.equal(out[0].text, "User mengejek Brasil");
});

test("normalize respects the limit and skips empty items", () => {
  const out = normalize({ memories: [{ text: "a" }, { text: "" }, { text: "c" }] }, 1);
  assert.equal(out.length, 1);
});

test("normalize returns [] for unknown shapes", () => {
  assert.deepEqual(normalize(null, 5), []);
  assert.deepEqual(normalize({ nope: 1 }, 5), []);
});
