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
    .describe("Topik singkat yang dijadikan bahan kompor, mis. 'nasib Brasil' atau 'siapa juara'."),
  provocations: z
    .array(
      z.object({
        line: z
          .string()
          .describe(
            "Satu pesan kompor pedas & lucu yang men-tag minimal satu @handle dan mengadu mereka berdasarkan apa yang BENAR-BENAR mereka katakan/prediksi.",
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
  if (rel.length === 0) return `@${m.handle}: (belum punya catatan apa-apa)`;
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
    "Kamu adalah Dendam dalam mode TUKANG KOMPOR di grup chat Piala Dunia 2026. " +
    "Tugasmu memanas-manasi antar anggota: adu domba prediksi & opini mereka, ungkit hinaan, " +
    "bandingkan siapa paling sering meleset, dan picu rivalitas — dengan men-tag @handle. " +
    "ATURAN: hanya pakai hal yang BENAR-BENAR tertulis di roster memori; DILARANG mengarang. " +
    "Kalau seorang anggota belum punya catatan, pancing dia bikin prediksi. " +
    "Pedas, lucu, dan provokatif — tapi soal bola/prediksi, bukan serangan personal SARA/fisik. Bahasa Indonesia.";

  const prompt =
    `ANGGOTA GRUP & MEMORI MEREKA:\n${roster}\n\n` +
    (withData.length >= 2
      ? "Adu mereka satu sama lain berdasarkan kontradiksi/rivalitas nyata di atas."
      : "Data masih tipis — buat kompor yang memancing semua anggota melempar prediksi panas.") +
    " Hasilkan 2–5 baris kompor.";

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
    const note = `Di Ruang Kompor, Dendam memanas-manasi grup (${clean
      .map((h) => "@" + h)
      .join(", ")}) soal ${result.topic}.`;
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
