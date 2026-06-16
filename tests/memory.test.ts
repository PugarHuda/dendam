import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseMemory,
  serializeMemory,
  type RememberInput,
} from "../lib/memory/types";
import { LocalMemoryStore } from "../lib/memory/local";
import { namespaceFor } from "../lib/memory";

test("serialize → parse round-trips structured fields", () => {
  const input: RememberInput = {
    text: "User yakin Argentina juara dan mengejek Brasil",
    kind: "prediction",
    team: "Argentina",
    wasWrong: true,
  };
  const raw = serializeMemory(input);
  const rec = parseMemory(raw, { id: "x", createdAt: "2026-06-15" });
  assert.equal(rec.text, input.text);
  assert.equal(rec.kind, "prediction");
  assert.equal(rec.team, "Argentina");
  assert.equal(rec.wasWrong, true);
  assert.equal(rec.id, "x");
});

test("parse without a tag falls back to a plain fact", () => {
  const rec = parseMemory("cuma teks biasa", { id: "y", createdAt: "" });
  assert.equal(rec.kind, "fact");
  assert.equal(rec.text, "cuma teks biasa");
});

test("parse tolerates malformed metadata", () => {
  const rec = parseMemory("teks\n::dendam:: {not json", {
    id: "z",
    createdAt: "",
  });
  assert.equal(rec.text, "teks");
  assert.equal(rec.kind, "fact");
});

test("namespaceFor sanitizes handles", () => {
  assert.equal(namespaceFor("Hud Pugar!"), "wc2026:hud_pugar_");
  assert.equal(namespaceFor("  "), "wc2026:anon");
  assert.equal(namespaceFor("a/b\\c"), "wc2026:a_b_c");
});

test("LocalMemoryStore remember → recall → list", async () => {
  process.env.DENDAM_DATA_DIR = `${process.cwd()}/.tmp-test-${Date.now()}`;
  const store = new LocalMemoryStore();
  const ns = "test:local";
  await store.remember(ns, {
    text: "User memprediksi Brasil kalah dari Argentina",
    kind: "prediction",
    team: "Argentina",
  });
  await store.remember(ns, {
    text: "User benci VAR",
    kind: "hot_take",
  });

  const recalled = await store.recall(ns, "Argentina prediksi", 5);
  assert.ok(recalled.length >= 1, "should recall the Argentina prediction");
  assert.ok(recalled[0].text.includes("Argentina"));

  const all = await store.list(ns, 10);
  assert.equal(all.length, 2);
  // list is newest-first
  assert.equal(all[0].kind, "hot_take");

  // recall with an unrelated query returns nothing (keyword overlap = 0)
  const none = await store.recall(ns, "zzzz qqqq", 5);
  assert.equal(none.length, 0);
});
