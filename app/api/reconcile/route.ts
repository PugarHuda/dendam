import { getMemoryStore, namespaceFor } from "@/lib/memory";
import { listResults } from "@/lib/results";
import { judgePrediction, Verdict } from "@/lib/verdict";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST { handle } — confront the user's standing predictions with the real
// results. Each newly-resolved prediction becomes a permanent "result"
// grudge stored on Walrus (wasWrong flag drives the roast + dossier stats).
export async function POST(req: Request) {
  const { handle } = (await req.json().catch(() => ({}))) as {
    handle?: string;
  };
  const store = getMemoryStore();
  const namespace = namespaceFor(handle || "anon");

  const results = await listResults();
  if (results.length === 0) {
    return Response.json({ verdicts: [], note: "no_results_yet" });
  }

  // Enumerate ALL of the user's memories, then split out standing
  // predictions and already-issued verdicts (for dedupe). Using list()
  // instead of a keyword recall ensures we confront every prediction.
  const all = await store.list(namespace, 200);
  const predictions = all.filter((r) => r.kind === "prediction");
  const judgedText = all
    .filter((r) => r.kind === "result")
    .map((r) => r.text);

  const fresh = predictions.filter(
    (p) => !judgedText.some((v) => v.includes(p.text.slice(0, 40))),
  );

  const verdicts: Verdict[] = [];
  for (const p of fresh) {
    const v = await judgePrediction(p.text, results);
    if (v.status === "pending") continue;
    verdicts.push(v);
    // Persist the verdict as a durable grudge on Walrus.
    await store.remember(namespace, {
      text: `Vonis untuk prediksi: "${p.text.slice(0, 80)}" — ${v.roast}`,
      kind: "result",
      team: p.team,
      wasWrong: v.status === "wrong",
    });
  }

  return Response.json({
    backend: store.backend,
    judged: verdicts.length,
    verdicts,
  });
}
