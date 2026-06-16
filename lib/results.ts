import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "./datadir";

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

export async function addResults(results: MatchResult[]): Promise<number> {
  const existing = await listResults();
  const byId = new Map(existing.map((r) => [r.id, r]));
  for (const r of results) byId.set(r.id, r); // upsert by id
  const merged = [...byId.values()];
  const f = file();
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(merged, null, 2), "utf8");
  return merged.length;
}
