import { getMemoryStore, memoryNetwork, namespaceFor } from "./memory";
import { listCached } from "./listcache";

// One handle's public "file" summary — computed purely from stored memories.
// Shared by the /share/[handle] page and its per-handle OG image so the card
// and the page never drift.
export interface HandleStats {
  handle: string;
  total: number;
  predictions: number;
  wrong: number;
  correct: number;
  insults: number;
  accuracy: number | null; // correct / (correct + wrong), 0..1; null if nothing resolved
  topLine: string | null; // a representative line to feature on the card
  network: string; // "mainnet" | "testnet" | "local"
}

export function emptyStats(handle: string): HandleStats {
  return {
    handle,
    total: 0,
    predictions: 0,
    wrong: 0,
    correct: 0,
    insults: 0,
    accuracy: null,
    topLine: null,
    network: "",
  };
}

// Who's the bigger fraud between two files: most wrong calls, then worst
// accuracy (an unresolved file counts as a perfect 1.0 so it never "loses"
// to someone who's actually been wrong), then the most trash talk. Returns
// null on a dead heat. Pure — shared by the /share/vs page and its OG image.
export function biggerFraud(
  a: HandleStats,
  b: HandleStats,
): HandleStats | null {
  if (a.wrong !== b.wrong) return a.wrong > b.wrong ? a : b;
  const accA = a.accuracy ?? 1;
  const accB = b.accuracy ?? 1;
  if (accA !== accB) return accA < accB ? a : b;
  if (a.insults !== b.insults) return a.insults > b.insults ? a : b;
  return null;
}

export async function statsForHandle(
  handle: string,
  limit = 200,
): Promise<HandleStats> {
  const store = getMemoryStore();
  const memories = await listCached(store, namespaceFor(handle), limit);

  const predictions = memories.filter((m) => m.kind === "prediction");
  const insults = memories.filter((m) => m.kind === "insult");
  const verdicts = memories.filter((m) => m.kind === "result");
  const wrong = verdicts.filter((m) => m.wasWrong).length;
  const correct = verdicts.filter((m) => m.wasWrong === false).length;
  const resolved = wrong + correct;

  // Feature the most damning line we have: a busted prediction (wrong verdict)
  // beats an insult beats a raw prediction beats anything at all.
  const topLine =
    verdicts.find((m) => m.wasWrong)?.text ??
    insults[0]?.text ??
    predictions[0]?.text ??
    memories[0]?.text ??
    null;

  return {
    handle,
    total: memories.length,
    predictions: predictions.length,
    wrong,
    correct,
    insults: insults.length,
    accuracy: resolved > 0 ? correct / resolved : null,
    topLine,
    network: memoryNetwork(),
  };
}
