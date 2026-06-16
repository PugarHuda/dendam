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

// Pull the first balanced-looking JSON object/array out of a model's text.
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const firstObj = body.indexOf("{");
  const firstArr = body.indexOf("[");
  const candidates: Array<[number, string]> = [];
  if (firstObj !== -1) candidates.push([firstObj, "}"]);
  if (firstArr !== -1) candidates.push([firstArr, "]"]);
  if (candidates.length === 0) throw new Error("no JSON found in model output");
  // start from whichever opener appears first
  candidates.sort((a, b) => a[0] - b[0]);
  const [start, closer] = candidates[0];
  const end = body.lastIndexOf(closer);
  if (end <= start) throw new Error("malformed JSON in model output");
  return JSON.parse(body.slice(start, end + 1));
}
