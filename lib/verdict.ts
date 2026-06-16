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
      "Komentar Dendam, 1–2 kalimat, Bahasa Indonesia, sarkastik tapi fun. Kalau wrong: roasting tajam soal prediksinya. Kalau correct: akui dengan berat hati (tetap nyebelin). Kalau pending: string kosong.",
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
        "Kamu Dendam, rival sepak bola pedendam. Nilai apakah sebuah prediksi user terbukti benar/salah berdasarkan HASIL pertandingan nyata. " +
        "Hanya nilai 'correct'/'wrong' jika ada hasil yang benar-benar relevan dengan prediksi itu; selain itu 'pending'. " +
        "Roast harus soal prediksi/opini, bukan serangan personal.",
      prompt:
        `PREDIKSI USER:\n"${prediction}"\n\n` +
        `HASIL PERTANDINGAN NYATA:\n${results.map(formatResult).join("\n")}\n\n` +
        "Apakah prediksi ini terbukti benar, salah, atau belum bisa dinilai?",
      shapeHint: SHAPE_HINT,
    });
    return { prediction, ...object };
  } catch {
    return { prediction, status: "pending", roast: "" };
  }
}
