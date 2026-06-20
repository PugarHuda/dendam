import { getMemoryStore, memoryNetwork, namespaceFor } from "./memory";

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

export async function statsForHandle(
  handle: string,
  limit = 200,
): Promise<HandleStats> {
  const store = getMemoryStore();
  const memories = await store.list(namespaceFor(handle), limit);

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
