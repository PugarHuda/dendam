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
            "One concise, factual sentence in ENGLISH from Dendam's POV about the user. Example: 'User predicted Argentina would beat Brazil 3-0 in the group stage and mocked Brazil.'",
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
          .describe("Related team, if any. null if not relevant."),
        wasWrong: z
          .boolean()
          .nullable()
          .describe(
            "true ONLY if this is a prediction/claim already proven WRONG. Otherwise null.",
          ),
      }),
    )
    .max(3)
    .describe(
      "Things worth holding against the user later. Leave empty if nothing important (greetings/small talk).",
    ),
});

const SHAPE_HINT = `{"memories":[{"text":"string","kind":"prediction|result|insult|favorite|hot_take|fact","team":"string or null","wasWrong":true/false/null}]}`;

export async function extractGrudges(
  userText: string,
  assistantText: string,
): Promise<RememberInput[]> {
  try {
    const object = await generateJSON({
      schema: extractionSchema,
      system:
        "You are the memory-extraction engine for a football rival agent named Dendam. " +
        "From the conversation, extract ONLY durable facts useful to hold against the user later: " +
        "match predictions, strong claims/opinions, favorite/hated teams, and insults the user threw at Dendam. " +
        "The user may write in ANY language with typos, slang, or abbreviations — understand intent regardless. " +
        "Ignore small talk. ALWAYS write the stored memory text in ENGLISH, from Dendam's POV about the user.",
      prompt: `USER MESSAGE:\n${userText}\n\nDENDAM REPLY:\n${assistantText}\n\nExtract the memories worth saving.`,
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
