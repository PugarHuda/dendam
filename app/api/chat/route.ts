import { streamText, type CoreMessage } from "ai";
import { dendamModel } from "@/lib/model";
import { extractGrudges } from "@/lib/grudge";
import { getMemoryStore, memoryNetwork, namespaceFor } from "@/lib/memory";
import { DENDAM_SYSTEM, renderMemoryBlock } from "@/lib/persona";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, handle } = (await req.json()) as {
    messages: CoreMessage[];
    handle?: string;
  };

  const store = getMemoryStore();
  const namespace = namespaceFor(handle || "anon");

  // The latest user turn is the recall query.
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const query =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : JSON.stringify(lastUser?.content ?? "");

  // 1) RECALL — pull what Dendam remembers about this user from Walrus.
  // Skip on an empty query (e.g. a non-text first turn) to avoid a useless call.
  let recalled: Awaited<ReturnType<typeof store.recall>> = [];
  if (query.trim()) {
    try {
      recalled = await store.recall(namespace, query, 8);
    } catch (err) {
      console.error("[dendam] recall failed:", err);
    }
  }

  const system = `${DENDAM_SYSTEM}\n\n${renderMemoryBlock(recalled)}`;

  // 2) RESPOND — Claude answers in-character, armed with the memories.
  const result = streamText({
    model: dendamModel,
    system,
    messages,
    temperature: 0.85,
    async onFinish({ text }) {
      // 3) REMEMBER — distil this exchange into durable grudges and
      // persist them to Walrus for future sessions.
      try {
        const grudges = await extractGrudges(query, text);
        for (const g of grudges) {
          await store.remember(namespace, g);
        }
      } catch (err) {
        console.error("[dendam] remember failed:", err);
      }
    },
  });

  return result.toDataStreamResponse({
    headers: {
      "x-dendam-backend": store.backend,
      "x-dendam-network": memoryNetwork(),
    },
  });
}
