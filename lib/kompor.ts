import { z } from "zod";
import { getMemoryStore, namespaceFor } from "./memory";
import { MemoryRecord } from "./memory/types";
import { generateJSON } from "./structured";

// "Tukang kompor" mode: Dendam reads several members' real stored memories
// (predictions, insults, favorites, hot takes) and stirs beef between them —
// quoting one person's take back at a rival. This is memory doing real work
// across users, not just one-on-one.

export interface KomporMember {
  handle: string;
  memories: MemoryRecord[];
}

const komporSchema = z.object({
  topic: z
    .string()
    .describe("Short topic used as the fuel, e.g. 'Brazil's fate' or 'who wins it all'."),
  provocations: z
    .array(
      z.object({
        line: z
          .string()
          .describe(
            "One spicy, funny instigating message that tags at least one @handle and pits members against each other based on what they ACTUALLY said/predicted.",
          ),
      }),
    )
    .min(1)
    .max(6),
});

const SHAPE_HINT = `{"topic":"string","provocations":[{"line":"string dengan @handle"}]}`;

const KINDS_OF_INTEREST = new Set([
  "prediction",
  "insult",
  "favorite",
  "hot_take",
  "result",
]);

function renderMember(m: KomporMember): string {
  const rel = m.memories.filter((x) => KINDS_OF_INTEREST.has(x.kind));
  if (rel.length === 0) return `@${m.handle}: (no record yet)`;
  const lines = rel
    .slice(0, 12)
    .map((x) => `  - [${x.kind}${x.team ? `/${x.team}` : ""}] ${x.text}`)
    .join("\n");
  return `@${m.handle}:\n${lines}`;
}

// Generate provocations for a set of members (already loaded with memories).
export async function generateKompor(
  members: KomporMember[],
): Promise<z.infer<typeof komporSchema>> {
  const withData = members.filter((m) =>
    m.memories.some((x) => KINDS_OF_INTEREST.has(x.kind)),
  );

  const roster = members.map(renderMember).join("\n\n");

  const system =
    "You are Dendam in INSTIGATOR mode in a World Cup 2026 group chat. " +
    "Your job is to stir the pot between members: pit their predictions & opinions against each other, dredge up insults, " +
    "compare who's been most often wrong, and spark rivalries — tagging @handle. " +
    "RULE: only use things ACTUALLY written in the memory roster; inventing is FORBIDDEN. " +
    "If a member has no record yet, bait them into making a prediction. " +
    "Spicy, funny, provocative — but about football/predictions, never personal/identity attacks. " +
    "Reply in ENGLISH by default (members may have written in other languages — you still understand them).";

  const prompt =
    `GROUP MEMBERS & THEIR MEMORIES:\n${roster}\n\n` +
    (withData.length >= 2
      ? "Pit them against each other based on the real contradictions/rivalries above."
      : "Data is thin — write instigation that bait every member into dropping hot predictions.") +
    " Produce 2–5 instigating lines.";

  return generateJSON({
    schema: komporSchema,
    system,
    prompt,
    shapeHint: SHAPE_HINT,
  });
}

// Load members' memories from the store, run the kompor, and (optionally)
// remember that Dendam stirred this beef in each member's namespace.
export async function komporForHandles(
  handles: string[],
  remember = true,
): Promise<z.infer<typeof komporSchema> & { members: string[] }> {
  const store = getMemoryStore();
  const clean = [...new Set(handles.map((h) => h.trim()).filter(Boolean))];

  const members: KomporMember[] = [];
  for (const h of clean) {
    const memories = await store.list(namespaceFor(h), 50);
    members.push({ handle: h, memories });
  }

  const result = await generateKompor(members);

  if (remember && clean.length >= 2) {
    const note = `In the Hot Seat, Dendam stirred up the group (${clean
      .map((h) => "@" + h)
      .join(", ")}) over ${result.topic}.`;
    for (const h of clean) {
      try {
        await store.remember(namespaceFor(h), {
          text: note,
          kind: "fact",
        });
      } catch {
        // non-fatal
      }
    }
  }

  return { ...result, members: clean };
}
