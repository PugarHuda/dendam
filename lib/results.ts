import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "./datadir";
import { getMemoryStore, namespaceFor } from "./memory";

// Real-world World Cup 2026 match results. These are GLOBAL public facts
// (not per-user memory), so they live in their own file store. When a
// result lands, the reconcile flow checks each user's predictions against
// it and turns failures into permanent grudges.
export interface MatchResult {
  id: string; // e.g. "ARG-BRA-2026-06-15"
  date: string; // ISO date (YYYY-MM-DD)
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  stage?: string;
}

// Computed lazily so DENDAM_DATA_DIR (used in tests) is honored at call time.
function file(): string {
  return path.join(dataDir(), "results.json");
}

export function winnerOf(r: MatchResult): string | "draw" {
  if (r.scoreA > r.scoreB) return r.teamA;
  if (r.scoreB > r.scoreA) return r.teamB;
  return "draw";
}

export function formatResult(r: MatchResult): string {
  const w = winnerOf(r);
  const tail = w === "draw" ? "(draw)" : `→ ${w} won`;
  return `${r.date} · ${r.teamA} ${r.scoreA}-${r.scoreB} ${r.teamB} ${tail}${
    r.stage ? ` [${r.stage}]` : ""
  }`;
}

export async function listResults(): Promise<MatchResult[]> {
  try {
    const buf = await fs.readFile(file(), "utf8");
    const arr = JSON.parse(buf) as MatchResult[];
    return arr.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

// A row is only persisted if it has the fields the rest of the app relies on:
// a non-empty `id` (the upsert key — a missing id would collapse rows together)
// and `date` (used for sorting via localeCompare, which throws on undefined),
// two team names, and numeric scores (winnerOf compares them).
export function isValidResult(r: unknown): r is MatchResult {
  const m = r as Partial<MatchResult> | null;
  return (
    !!m &&
    typeof m.id === "string" && m.id.trim() !== "" &&
    typeof m.date === "string" && m.date.trim() !== "" &&
    typeof m.teamA === "string" && m.teamA.trim() !== "" &&
    typeof m.teamB === "string" && m.teamB.trim() !== "" &&
    typeof m.scoreA === "number" && Number.isFinite(m.scoreA) &&
    typeof m.scoreB === "number" && Number.isFinite(m.scoreB)
  );
}

// Returns the merged total, or -1 if every incoming row was invalid (nothing
// was written) so callers can surface a 400 instead of a silent no-op.
export async function addResults(results: MatchResult[]): Promise<number> {
  const valid = results.filter(isValidResult);
  if (valid.length === 0) return -1;
  const existing = await listResults();
  const byId = new Map(existing.map((r) => [r.id, r]));
  for (const r of valid) byId.set(r.id, r); // upsert by id
  const merged = [...byId.values()];
  const f = file();
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(merged, null, 2), "utf8");
  return merged.length;
}

// ── On-chain results (Walrus) ──────────────────────────────────
// Global match results also live in their own Walrus namespace, so the
// scoreboard the auto-roast judges against is itself on-chain + verifiable —
// not just a per-instance /tmp file. Each result is stored as one compact-JSON
// memory (kind "result", id mirrored into `team`), so it round-trips cleanly.
const RESULTS_NS = namespaceFor("wc2026-global-results");

export async function storeResultsOnChain(results: MatchResult[]): Promise<number> {
  const valid = results.filter(isValidResult);
  if (valid.length === 0) return 0;
  const store = getMemoryStore();
  const existing = new Set((await listResultsOnChain()).map((r) => r.id));
  let n = 0;
  for (const r of valid) {
    if (existing.has(r.id)) continue; // don't double-write the same match
    try {
      await store.remember(RESULTS_NS, { text: JSON.stringify(r), kind: "result", team: r.id });
      n++;
    } catch {
      /* best-effort */
    }
  }
  return n;
}

export async function listResultsOnChain(): Promise<MatchResult[]> {
  const store = getMemoryStore();
  try {
    const recs = await store.list(RESULTS_NS, 200);
    const out: MatchResult[] = [];
    for (const rec of recs) {
      try {
        const obj = JSON.parse(rec.text);
        if (isValidResult(obj)) out.push(obj);
      } catch {
        /* skip anything that isn't a result JSON */
      }
    }
    return out;
  } catch {
    return []; // relayer hiccup → fall back to the other sources
  }
}
