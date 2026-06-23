import { generateText, type CoreMessage } from "ai";
import { dendamModel } from "./model";
import { DENDAM_SYSTEM } from "./persona";

// The ONLY case where a weak free model fabricates a fake past is when it has
// NO recalled memory to ground on. We detect that case server-side and make
// the reply deterministically safe: generate → check for fabricated-past
// phrasing → retry once cooler → fall back to a hard-coded line. This keeps
// the whole thing free and model-agnostic; the guarantee comes from the guard,
// not from trusting the model to obey.

export const COLD_SYSTEM = `${DENDAM_SYSTEM}

DENDAM'S MEMORY: (no memories available for this turn)

HARD CONSTRAINT FOR THIS REPLY: You have NOTHING on this user right now. You are FORBIDDEN from claiming or implying they ever said, predicted, claimed, bet, or did anything before. Never write "you said", "you predicted", "last time", "earlier you", "remember when", "como cuando", "dijiste", "kemarin", "dulu lo", or any equivalent. Treat them as fresh: admit you have no record yet, then provoke them into making a concrete prediction so you'll have ammo to throw back later. Mirror the user's language.

Examples of the RIGHT cold-open (don't copy verbatim, match the user's language):
- "First time in my ring? Good. Drop a real prediction and I'll remember every word for when it blows up."
- "I've got nothing on you yet — so give me a bold call. A score, a winner, a team you're writing off."`;

// Phrases that imply a (nonexistent) prior history with the user. Multilingual.
const FABRICATED_PAST =
  /\b(you (said|claimed|predicted|told me|bet|swore|called)|your (prediction|pick|call|claim) (that|about|of)|last (time|week|year)|earlier you|remember when you|when you (said|predicted)|como cuando|cuando dijiste|dijiste que|predijiste|la última vez|antes dijiste|você (disse|previu|falou|apostou)|da última vez|tu (as|avais) (dit|prédit|juré)|la dernière fois|kemarin|tadi|waktu itu|sebelumnya kamu|dulu (lo|kamu|lu))\b/i;

export function mentionsFabricatedPast(text: string): boolean {
  return FABRICATED_PAST.test(text);
}

// Deterministic, guaranteed-clean fallback if the model keeps fabricating.
const FALLBACK =
  "I've got nothing on you yet — this is the first call I'm logging. So make it count: give me a real World Cup prediction (a score, a winner, a team you're writing off) and I'll remember every word and throw it back when it falls apart.";

export async function coldStartReply(messages: CoreMessage[]): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await generateText({
        model: dendamModel,
        system: COLD_SYSTEM,
        messages,
        temperature: attempt === 0 ? 0.8 : 0.3,
        maxTokens: 220,
      });
      const clean = text?.trim();
      if (clean && !mentionsFabricatedPast(clean)) return clean;
    } catch {
      // network/model error → try again, then fall back
    }
  }
  return FALLBACK;
}
