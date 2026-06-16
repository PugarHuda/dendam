import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModelV1 } from "ai";

// Provider-agnostic LLM setup. Dendam's "brain" can be either Anthropic
// directly or any model via OpenRouter (OpenAI-compatible endpoint).
//
//   - Set OPENROUTER_API_KEY  -> uses OpenRouter (default model: anthropic/claude-sonnet-4)
//   - Set ANTHROPIC_API_KEY   -> uses Anthropic directly (default: claude-sonnet-4-6)
//   - Force with DENDAM_LLM_PROVIDER = "openrouter" | "anthropic"
//   - Override the model id with DENDAM_MODEL.
//
// NOTE: Dendam uses structured output (generateObject) for memory
// extraction + verdicts, so pick a model that supports tool/JSON mode
// (Claude, GPT-4o-class, etc.).

const provider = (
  process.env.DENDAM_LLM_PROVIDER ||
  (process.env.OPENROUTER_API_KEY ? "openrouter" : "anthropic")
).toLowerCase();

function resolveModel(): { model: LanguageModelV1; id: string } {
  if (provider === "openrouter") {
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    const id = process.env.DENDAM_MODEL || "anthropic/claude-sonnet-4";
    return { model: openrouter(id), id };
  }
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const id = process.env.DENDAM_MODEL || "claude-sonnet-4-6";
  return { model: anthropic(id), id };
}

const resolved = resolveModel();

export const dendamModel = resolved.model;
export const MODEL_ID = resolved.id;
export const LLM_PROVIDER = provider;
