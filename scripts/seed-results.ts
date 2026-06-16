/* eslint-disable no-console */
// Seed a few sample World Cup 2026 results so the reconcile / auto-roast
// flow is demoable end-to-end without the live scoreboard.
//   npm run seed:results
import { addResults, listResults, MatchResult } from "../lib/results";

const SAMPLE: MatchResult[] = [
  {
    id: "ARG-BRA-2026-06-15",
    date: "2026-06-15",
    teamA: "Argentina",
    teamB: "Brasil",
    scoreA: 1,
    scoreB: 2,
    stage: "Grup",
  },
  {
    id: "FRA-GER-2026-06-16",
    date: "2026-06-16",
    teamA: "Prancis",
    teamB: "Jerman",
    scoreA: 0,
    scoreB: 0,
    stage: "Grup",
  },
  {
    id: "ENG-NED-2026-06-17",
    date: "2026-06-17",
    teamA: "Inggris",
    teamB: "Belanda",
    scoreA: 3,
    scoreB: 1,
    stage: "Grup",
  },
];

async function main() {
  const total = await addResults(SAMPLE);
  console.log(`Seeded ${SAMPLE.length} results. Total now: ${total}`);
  for (const r of await listResults()) {
    console.log(`  ${r.teamA} ${r.scoreA}-${r.scoreB} ${r.teamB} (${r.date})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
