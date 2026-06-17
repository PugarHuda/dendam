import { mapLimit } from "./async";
import { getMemoryStore, namespaceFor } from "./memory";

// A "Hall of Shame" leaderboard computed purely from each member's stored
// memories — no LLM needed. Ranks who's been most often wrong.
export interface LeaderboardRow {
  handle: string;
  predictions: number;
  wrong: number;
  correct: number;
  insults: number;
  accuracy: number | null; // correct / (correct + wrong), null if nothing resolved
}

export async function leaderboardForHandles(
  handles: string[],
): Promise<LeaderboardRow[]> {
  const store = getMemoryStore();
  const clean = [...new Set(handles.map((h) => h.trim()).filter(Boolean))];

  // Load each member's memories concurrently (bounded) — sequential awaits
  // here scale with group size and risk the 60s serverless limit.
  const rows: LeaderboardRow[] = await mapLimit(clean, 4, async (h) => {
    const memories = await store.list(namespaceFor(h), 200);
    const predictions = memories.filter((m) => m.kind === "prediction").length;
    const insults = memories.filter((m) => m.kind === "insult").length;
    // Verdicts (kind "result") carry the resolved truth.
    const verdicts = memories.filter((m) => m.kind === "result");
    const wrong = verdicts.filter((m) => m.wasWrong).length;
    const correct = verdicts.filter((m) => m.wasWrong === false).length;
    const resolved = wrong + correct;
    return {
      handle: h,
      predictions,
      wrong,
      correct,
      insults,
      accuracy: resolved > 0 ? correct / resolved : null,
    };
  });

  // Hall of Shame order: most wrong first, then most insults, then fewest
  // predictions (all talk, no calls).
  rows.sort(
    (a, b) =>
      b.wrong - a.wrong ||
      b.insults - a.insults ||
      a.predictions - b.predictions,
  );
  return rows;
}
