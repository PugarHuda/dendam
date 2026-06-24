/* eslint-disable no-console */
// Seed REAL on-chain demo data to Walrus (Sui Mainnet via MemWal):
//   1. World Cup 2026 match results (drives reconcile / scoreboard / rooms)
//   2. Populated "Files" for the Hall-of-Shame handles (predictions, busted
//      verdicts, insults, hot takes) so the leaderboard reflects real memory
//   3. A seeded match-room thread (cross-user chat + a Dendam line)
//
// Idempotent: a handle/room that's already populated is skipped, so it's safe
// to re-run. Usage: npm run seed:demo
import { getMemoryStore, namespaceFor, memoryNetwork } from "../lib/memory";
import { roomNamespace } from "../lib/rooms";
import { addResults, type MatchResult } from "../lib/results";
import type { RememberInput } from "../lib/memory/types";

const RESULTS: MatchResult[] = [
  { id: "ARG-BRA-2026-06-15", date: "2026-06-15", teamA: "Argentina", teamB: "Brazil", scoreA: 1, scoreB: 2, stage: "Group" },
  { id: "FRA-GER-2026-06-16", date: "2026-06-16", teamA: "France", teamB: "Germany", scoreA: 0, scoreB: 0, stage: "Group" },
  { id: "ENG-NED-2026-06-17", date: "2026-06-17", teamA: "England", teamB: "Netherlands", scoreA: 3, scoreB: 1, stage: "Group" },
  { id: "WC2026-BRA-ARG-QF", date: "2026-07-04", teamA: "Brazil", teamB: "Argentina", scoreA: 2, scoreB: 1, stage: "Quarter-final" },
];

// Each handle's File. Mix of predictions, busted verdicts (wasWrong), insults
// and hot takes — tuned so the Hall of Shame ranks believably (budi = fraud).
const P = (text: string, kind: RememberInput["kind"], team?: string, wasWrong?: boolean): RememberInput => ({ text, kind, team, wasWrong });
const PEOPLE: Record<string, RememberInput[]> = {
  budi: [
    P("User predicts Argentina win the 2026 World Cup, easy.", "prediction", "Argentina"),
    P("User predicts Brazil crash out in the group stage.", "prediction", "Brazil"),
    P("Verdict: backed Argentina to lift it, then watched Brazil knock them out. Crystal ball's cracked.", "result", "Argentina", true),
    P("Verdict: swore Brazil were done in the group — they topped it. Filed under delusion.", "result", "Brazil", true),
    P("User called Dendam a clueless bot that knows nothing about football.", "insult"),
    P("User thinks VAR should be scrapped entirely.", "hot_take"),
  ],
  hud: [
    P("User predicts Mbappé outscores Messi this tournament.", "prediction"),
    P("User predicts France go all the way.", "prediction", "France"),
    P("Verdict: said Argentina were unbeatable — out in the quarters. Nice try.", "result", "Argentina", true),
    P("User called Dendam a salty chatbot.", "insult"),
  ],
  sarah: [
    P("User predicts Spain park the bus and nick the semi.", "prediction", "Spain"),
    P("User predicts England finally win a shootout.", "prediction", "England"),
    P("Verdict: tipped Netherlands over England — lost 3-1. Bookmarked.", "result", "Netherlands", true),
    P("User thinks the new ball is impossible for keepers.", "hot_take"),
  ],
  reyhan: [
    P("User predicts Brazil win the final.", "prediction", "Brazil"),
    P("User predicts Germany top their group.", "prediction", "Germany"),
    P("Verdict: Germany only drew — group hopes shaky.", "result", "Germany", true),
  ],
  ta: [
    P("User predicts Brazil edge Argentina in the quarter-final.", "prediction", "Brazil"),
    P("User backs Brazil to win the pool.", "prediction", "Brazil"),
    P("Verdict: called Brazil 2-1 over Argentina — nailed it.", "result", "Brazil", false),
  ],
  sol: [
    P("User predicts France beat Spain by two in the semi.", "prediction", "France"),
    P("User thinks Mbappé is the player of the tournament already.", "hot_take"),
  ],
  kontiki: [
    P("User predicts France lift the trophy.", "prediction", "France"),
    P("User predicts Brazil sneak the final by a single goal.", "prediction", "Brazil"),
  ],
  ani: [
    P("User predicts a low-scoring final.", "prediction"),
    P("User thinks the group stage was the best in years.", "hot_take"),
  ],
};

const ROOM = {
  id: "WC2026-FRA-ESP-SF",
  chat: [
    ["@sol", "France by two. Mbappé runs this one. 🇫🇷"],
    ["Dendam", "@sol bold — last time you called a 'sure thing' it aged like milk. Screenshotting this."],
    ["@ta", "Spain park the bus and nick it. Remember I said this."],
    ["@demo", "Penalties. Both these teams choke, it's written."],
  ] as [string, string][],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The MemWal delegate key is capped at ~30 weighted-requests/min, so we pace
// writes (~18/min) and back off on a 429 instead of failing the whole seed.
async function write(store: ReturnType<typeof getMemoryStore>, ns: string, m: RememberInput) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      await store.remember(ns, m);
      await sleep(3200);
      return;
    } catch (err) {
      const e = err as { status?: number; cause?: string };
      if (e?.status === 429) {
        let wait = 62;
        try {
          wait = (JSON.parse(e.cause || "{}").retry_after_seconds ?? 60) + 3;
        } catch {
          /* default */
        }
        console.log(`    ⏳ rate-limited — waiting ${wait}s…`);
        await sleep(wait * 1000);
        continue;
      }
      throw err;
    }
  }
  throw new Error("write failed after retries");
}

async function main() {
  const store = getMemoryStore();
  console.log(`# Seeding real on-chain data · backend=${store.backend} · network=${memoryNetwork()}\n`);

  // 1) Results
  const added = await addResults(RESULTS);
  console.log(`✓ results: ${added} new stored on-chain (${RESULTS.length} total in set)\n`);

  // 2) Files per handle — resume from whatever's already on-chain (idempotent)
  for (const [handle, mems] of Object.entries(PEOPLE)) {
    const ns = namespaceFor(handle);
    const existing = await store.list(ns, 50).catch(() => []);
    const todo = mems.slice(existing.length);
    if (todo.length === 0) {
      console.log(`· @${handle}: already has ${existing.length} memories — skip`);
      continue;
    }
    console.log(`+ @${handle}: writing ${todo.length} memories (have ${existing.length})…`);
    for (const m of todo) {
      await write(store, ns, m);
      process.stdout.write(`    ${m.kind}${m.wasWrong ? " (wrong)" : ""}\n`);
    }
  }

  // 3) Room thread — resume from whatever's already there
  const rns = roomNamespace(ROOM.id);
  const existingRoom = await store.list(rns, 50).catch(() => []);
  const todoRoom = ROOM.chat.slice(existingRoom.length);
  if (todoRoom.length === 0) {
    console.log(`\n· room ${ROOM.id}: already has ${existingRoom.length} messages — skip`);
  } else {
    console.log(`\n+ room ${ROOM.id}: writing ${todoRoom.length} messages…`);
    for (const [who, text] of todoRoom) {
      await write(store, rns, { text, kind: "fact", team: who.replace(/^@/, "") });
      process.stdout.write(`    [${who}] ${text.slice(0, 40)}…\n`);
    }
  }

  console.log(`\n✅ Done. All written to Walrus — verify at /share/<name> or /dossier?handle=<name>.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
