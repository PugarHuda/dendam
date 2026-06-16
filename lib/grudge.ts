import { z } from "zod";
import { generateJSON } from "./structured";
import { RememberInput } from "./memory/types";

// After each exchange, a lightweight extraction pass pulls 0–3 durable
// facts worth keeping a grudge about. This is what gives Dendam genuine,
// growing memory instead of a transcript dump.
const extractionSchema = z.object({
  memories: z
    .array(
      z.object({
        text: z
          .string()
          .describe(
            "Satu kalimat ringkas, faktual, sudut pandang Dendam tentang user. Contoh: 'User memprediksi Argentina mengalahkan Brasil 3-0 di fase grup dan mengejek Brasil.'",
          ),
        kind: z.enum([
          "prediction",
          "result",
          "insult",
          "favorite",
          "hot_take",
          "fact",
        ]),
        team: z
          .string()
          .nullable()
          .describe("Tim terkait, jika ada. null kalau tidak relevan."),
        wasWrong: z
          .boolean()
          .nullable()
          .describe(
            "true HANYA jika ini prediksi/klaim yang sudah terbukti SALAH. Selain itu null.",
          ),
      }),
    )
    .max(3)
    .describe(
      "Hal yang layak diingat untuk ditagih nanti. Kosongkan jika tidak ada yang penting (sapaan/basa-basi).",
    ),
});

const SHAPE_HINT = `{"memories":[{"text":"string","kind":"prediction|result|insult|favorite|hot_take|fact","team":"string atau null","wasWrong":true/false/null}]}`;

export async function extractGrudges(
  userText: string,
  assistantText: string,
): Promise<RememberInput[]> {
  try {
    const object = await generateJSON({
      schema: extractionSchema,
      system:
        "Kamu adalah mesin ekstraksi memori untuk agent rival sepak bola bernama Dendam. " +
        "Dari percakapan, tarik HANYA hal durable yang berguna untuk ditagih di masa depan: " +
        "prediksi pertandingan, klaim/opini kuat, tim jagoan/benci, dan hinaan user ke Dendam. " +
        "Abaikan basa-basi. Tulis dalam Bahasa Indonesia, sudut pandang Dendam tentang user.",
      prompt: `PESAN USER:\n${userText}\n\nJAWABAN DENDAM:\n${assistantText}\n\nEkstrak memori yang layak disimpan.`,
      shapeHint: SHAPE_HINT,
    });
    return object.memories.map((m) => ({
      text: m.text,
      kind: m.kind,
      team: m.team ?? undefined,
      wasWrong: m.wasWrong ?? undefined,
    }));
  } catch {
    // Never let extraction failure break the chat turn.
    return [];
  }
}
