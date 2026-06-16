import { z } from "zod";
import { generateJSON } from "./structured";
import { formatResult, MatchResult } from "./results";

const verdictSchema = z.object({
  status: z
    .enum(["correct", "wrong", "pending"])
    .describe(
      "correct = prediksi terbukti benar; wrong = terbukti meleset; pending = belum ada hasil yang relevan untuk menilai.",
    ),
  roast: z
    .string()
    .describe(
      "Dendam's comment, 1–2 sentences, in ENGLISH, sarcastic but fun. If wrong: a sharp roast about the prediction. If correct: grudgingly admit it (still annoying). If pending: empty string.",
    ),
});

export type Verdict = z.infer<typeof verdictSchema> & {
  prediction: string;
};

const SHAPE_HINT = `{"status":"correct|wrong|pending","roast":"string"}`;

// Judge a single prediction against the known results, in Dendam's voice.
export async function judgePrediction(
  prediction: string,
  results: MatchResult[],
): Promise<Verdict> {
  if (results.length === 0) {
    return { prediction, status: "pending", roast: "" };
  }
  try {
    const object = await generateJSON({
      schema: verdictSchema,
      system:
        "You are Dendam, a vengeful football rival. Judge whether a user's prediction turned out right or wrong based on REAL match results. " +
        "Only judge 'correct'/'wrong' if a result is genuinely relevant to that prediction; otherwise 'pending'. " +
        "The roast must be about the prediction/opinion, never a personal attack. Reply in ENGLISH.",
      prompt:
        `USER PREDICTION:\n"${prediction}"\n\n` +
        `REAL MATCH RESULTS:\n${results.map(formatResult).join("\n")}\n\n` +
        "Did this prediction turn out correct, wrong, or is it not yet judgeable?",
      shapeHint: SHAPE_HINT,
    });
    return { prediction, ...object };
  } catch {
    return { prediction, status: "pending", roast: "" };
  }
}
