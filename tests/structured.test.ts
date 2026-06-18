import assert from "node:assert/strict";
import { test } from "node:test";
import { extractJson } from "../lib/structured";

test("extractJson parses a bare object", () => {
  assert.deepEqual(extractJson('{"a":1,"b":"x"}'), { a: 1, b: "x" });
});

test("extractJson unwraps a ```json fence", () => {
  const out = extractJson('```json\n{"ok":true}\n```');
  assert.deepEqual(out, { ok: true });
});

test("extractJson handles a top-level array", () => {
  assert.deepEqual(extractJson('prefix [1,2,3] suffix'), [1, 2, 3]);
});

test("extractJson ignores prose AFTER valid JSON (the lastIndexOf bug)", () => {
  // A stray closing brace in the trailing prose used to make lastIndexOf
  // grab the wrong closer and throw.
  const out = extractJson('{"grudges":[{"text":"x"}]}\n\nHope that helps! :}');
  assert.deepEqual(out, { grudges: [{ text: "x" }] });
});

test("extractJson respects braces inside string values", () => {
  const out = extractJson('{"msg":"use {curly} and [square] here"}');
  assert.deepEqual(out, { msg: "use {curly} and [square] here" });
});

test("extractJson falls back to the object when prose has brackets first", () => {
  const out = extractJson('Here [is] the JSON: {"team":"Brazil"}');
  assert.deepEqual(out, { team: "Brazil" });
});

test("extractJson handles nested objects and escaped quotes", () => {
  const out = extractJson('{"a":{"b":1},"q":"he said \\"hi\\""}');
  assert.deepEqual(out, { a: { b: 1 }, q: 'he said "hi"' });
});

test("extractJson throws when there is no JSON", () => {
  assert.throws(() => extractJson("no json at all here"));
});
