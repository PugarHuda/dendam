import { isValidResult, listResults, MatchResult } from "./results";

// Bundled "seed" results compiled into the build (not the ephemeral /tmp
// results file, which is empty on a fresh serverless instance). This
// guarantees the auto-roast has something to judge against for a demo even
// before any real result is fed — e.g. the classic "Argentina wins it all,
// Brazil's done" prediction gets busted the moment Brazil knocks them out.
// Lowest priority: a manually-fed result or the live feed overrides a seed
// row with the same id. Set DENDAM_SEED_RESULTS=off to drop them entirely.
const SEED: MatchResult[] = [
  {
    id: "WC2026-BRA-ARG-QF",
    date: "2026-07-04",
    teamA: "Brazil",
    teamB: "Argentina",
    scoreA: 2,
    scoreB: 1,
    stage: "quarter-final",
  },
].filter(isValidResult);

function seedResults(): MatchResult[] {
  return process.env.DENDAM_SEED_RESULTS === "off" ? [] : SEED;
}

// Optional live match-results feed.
//
// When FOOTBALL_DATA_TOKEN is set, Dendam pulls FINISHED matches from
// football-data.org (free tier includes the FIFA World Cup, competition
// code "WC") and merges them with any manually-seeded results. Without a
// token, this is a no-op and the app falls back to the manual/seed feed —
// so the auto-roast still works either way.
//
// Docs: https://www.football-data.org/documentation/quickstart

const TTL_MS = 60_000; // cache per serverless instance to respect rate limits

let cache: { at: number; data: MatchResult[] } | null = null;

// Map football-data.org `matches[]` to our MatchResult[]. Pure + exported
// for testing. Drops anything not finished/parseable.
export function mapApiMatches(matches: unknown[]): MatchResult[] {
  const out: MatchResult[] = [];
  for (const raw of matches ?? []) {
    const m = raw as Record<string, unknown>;
    const score = (m.score as Record<string, unknown>)?.fullTime as
      | Record<string, unknown>
      | undefined;
    const home = m.homeTeam as Record<string, unknown> | undefined;
    const away = m.awayTeam as Record<string, unknown> | undefined;
    const teamA = (home?.shortName as string) || (home?.name as string);
    const teamB = (away?.shortName as string) || (away?.name as string);
    const date = String(m.utcDate ?? "").slice(0, 10);
    // Unplayed/abandoned matches report null scores — coerce only real
    // numbers (Number(null) is 0, which would fake a 0-0 result).
    const num = (v: unknown) => (typeof v === "number" ? v : NaN);
    const candidate: MatchResult = {
      id: String(m.id ?? `${teamA}-${teamB}-${date}`),
      date,
      teamA,
      teamB,
      scoreA: num(score?.home),
      scoreB: num(score?.away),
      stage: m.stage
        ? String(m.stage).replace(/_/g, " ").toLowerCase()
        : undefined,
    };
    if (isValidResult(candidate)) out.push(candidate);
  }
  return out;
}

// Merge stored (manual/seed) + live results, deduped by id. Live wins on a
// conflict (it's the source of truth once a match is official). Pure + tested.
export function mergeResults(
  stored: MatchResult[],
  live: MatchResult[],
): MatchResult[] {
  const byId = new Map<string, MatchResult>();
  for (const r of stored) byId.set(r.id, r);
  for (const r of live) byId.set(r.id, r);
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// Fetch FINISHED matches from football-data.org. Returns [] (never throws)
// when no token is set or the request fails, so callers degrade gracefully.
export async function fetchLiveResults(): Promise<MatchResult[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) return [];
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const comp = process.env.FOOTBALL_DATA_COMPETITION || "WC";
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${comp}/matches?status=FINISHED`,
      {
        headers: { "X-Auth-Token": token },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return cache?.data ?? [];
    const json = (await res.json()) as { matches?: unknown[] };
    const data = mapApiMatches(json.matches ?? []);
    cache = { at: Date.now(), data };
    return data;
  } catch {
    // network/timeout/parse — fall back to last good cache or nothing
    return cache?.data ?? [];
  }
}

// The full results set the app should reason over: file-backed (manual/seed)
// merged with the live feed. Used by GET /api/results and reconcile so the
// scoreboard + auto-roast stay correct whether results are fed by hand or
// pulled live.
export async function getAllResults(): Promise<MatchResult[]> {
  const [stored, live] = await Promise.all([listResults(), fetchLiveResults()]);
  // Priority (low → high): bundled seed < manual/tmp file < live feed.
  return mergeResults(mergeResults(seedResults(), stored), live);
}
