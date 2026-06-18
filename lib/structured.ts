import { generateObject, generateText } from "ai";
import { z } from "zod";
import { dendamModel } from "./model";

// Structured output with a graceful fallback.
//
// Many free / open models on OpenRouter don't reliably support native
// structured output (tool/JSON-schema mode) that `generateObject` needs.
// So we try the native path first, and if it throws we fall back to a
// plain `generateText` call that instructs the model to emit raw JSON,
// then extract + validate it with the same zod schema.
export async function generateJSON<T>(opts: {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  shapeHint: string;
}): Promise<T> {
  try {
    const { object } = await generateObject({
      model: dendamModel,
      schema: opts.schema,
      system: opts.system,
      prompt: opts.prompt,
    });
    return object;
  } catch {
    const { text } = await generateText({
      model: dendamModel,
      system:
        opts.system +
        "\n\nIMPORTANT: Reply with VALID JSON ONLY — no other text, no explanation, no code fence. " +
        "Expected JSON shape:\n" +
        opts.shapeHint,
      prompt: opts.prompt,
    });
    return opts.schema.parse(extractJson(text));
  }
}

// Pull the first balanced JSON object/array out of a model's text.
//
// We scan from each opener (`{` / `[`, whichever comes first) and track
// nesting depth — skipping over string contents so braces inside strings
// don't throw off the count — to find the *matching* closer. This beats a
// naive `lastIndexOf(closer)`, which grabs the wrong brace when the model
// appends prose containing a `}`/`]` after valid JSON (a common failure on
// the free-model fallback path this function exists to rescue).
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const openers: Array<[number, string, string]> = [];
  const firstObj = body.indexOf("{");
  const firstArr = body.indexOf("[");
  if (firstObj !== -1) openers.push([firstObj, "{", "}"]);
  if (firstArr !== -1) openers.push([firstArr, "[", "]"]);
  if (openers.length === 0) throw new Error("no JSON found in model output");
  // Try whichever opener appears first; fall back to the other if the first
  // turns out to be prose (e.g. "Here [is] the JSON: { ... }").
  openers.sort((a, b) => a[0] - b[0]);
  for (const [start, open, close] of openers) {
    const slice = balancedSlice(body, start, open, close);
    if (slice !== null) {
      try {
        return JSON.parse(slice);
      } catch {
        // not valid JSON from this opener — try the next candidate
      }
    }
  }
  throw new Error("malformed JSON in model output");
}

// Return the substring from `start` (an `open` char) through its matching
// `close`, or null if the braces never balance.
function balancedSlice(
  body: string,
  start: number,
  open: string,
  close: string,
): string | null {
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) return body.slice(start, i + 1);
  }
  return null;
}
