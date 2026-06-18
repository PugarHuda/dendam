import { mapLimit } from "@/lib/async";
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

  try {
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

    // Judge predictions concurrently (capped) so we stay well under the 60s
    // serverless limit; judgePrediction already swallows errors → "pending".
    const MAX_JUDGE = 12;
    const CONCURRENCY = 5;
    const toJudge = fresh.slice(0, MAX_JUDGE);
    const judged = await mapLimit(toJudge, CONCURRENCY, async (p) => ({
      p,
      v: await judgePrediction(p.text, results),
    }));

    // Persist verdicts sequentially (the local file store isn't safe for
    // parallel writes; the relayer is, but sequential here is plenty fast).
    const verdicts: Verdict[] = [];
    for (const { p, v } of judged) {
      if (v.status === "pending") continue;
      verdicts.push(v);
      await store.remember(namespace, {
        text: `Verdict on prediction: "${p.text.slice(0, 80)}" — ${v.roast}`,
        kind: "result",
        team: p.team,
        wasWrong: v.status === "wrong",
      });
    }

    return Response.json({
      backend: store.backend,
      judged: verdicts.length,
      skipped: Math.max(0, fresh.length - toJudge.length),
      verdicts,
    });
  } catch (err) {
    // A relayer/network error in list() or remember() must not become an
    // unhandled rejection in the serverless handler.
    console.error("reconcile failed:", err);
    return Response.json({ error: "reconcile_failed" }, { status: 500 });
  }
}
