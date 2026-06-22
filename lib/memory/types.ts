// The kinds of things Dendam keeps a grudge about.
export type GrudgeKind =
  | "prediction" // a call the user made about a match/tournament
  | "result" // the real-world outcome (used to confront failed predictions)
  | "insult" // trash talk the user threw at Dendam — never forgotten
  | "favorite" // the user's loved team / hated team
  | "hot_take" // a strong opinion Dendam can throw back later
  | "fact"; // any other durable fact about the user

// A single memory as Dendam understands it. The natural-language `text`
// is what gets semantically embedded by Walrus Memory; `kind`/`team` are
// metadata we encode alongside it and parse back on recall.
export interface MemoryRecord {
  id: string;
  text: string;
  kind: GrudgeKind;
  team?: string;
  // Whether the predicted/claimed thing turned out wrong. Drives the roast.
  wasWrong?: boolean;
  createdAt: string; // ISO timestamp
  // Walrus blob id this memory is stored in, when the backend exposes it —
  // used for per-memory "verify on Walrus" provenance links.
  blobId?: string;
}

export interface RememberInput {
  text: string;
  kind: GrudgeKind;
  team?: string;
  wasWrong?: boolean;
}

// A storage backend for Dendam's memory. Implemented by both the
// Walrus Memory (MemWal) adapter and the local dev fallback.
export interface MemoryStore {
  readonly backend: "memwal" | "local";
  remember(namespace: string, input: RememberInput): Promise<void>;
  recall(
    namespace: string,
    query: string,
    limit?: number,
  ): Promise<MemoryRecord[]>;
  // Best-effort full listing for the public "The File" dossier.
  list(namespace: string, limit?: number): Promise<MemoryRecord[]>;
}

// ── (de)serialization ──────────────────────────────────────────
// We pack metadata into the stored text so a plain text-only memory
// layer still round-trips structure. The natural sentence stays first
// (so semantic embedding stays meaningful); a tagged JSON line follows.
const TAG = "::dendam::";

export function serializeMemory(input: RememberInput): string {
  // Defang the stored text so a crafted memory can't (a) FAKE its metadata —
  // parseMemory keys on the FIRST `::dendam::` tag, so an embedded tag would
  // win over the real one we append — or (b) inject extra "memory" lines into
  // the recalled-memory prompt block. Memories are a single sentence, so we
  // can safely strip our delimiter and collapse all whitespace to one space.
  const safeText = input.text
    .replace(/::dendam::/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const meta = JSON.stringify({
    kind: input.kind,
    team: input.team ?? null,
    wasWrong: input.wasWrong ?? null,
  });
  return `${safeText}\n${TAG} ${meta}`;
}

export function parseMemory(
  raw: string,
  fallback: { id: string; createdAt: string },
): MemoryRecord {
  const idx = raw.indexOf(TAG);
  if (idx === -1) {
    return {
      id: fallback.id,
      text: raw.trim(),
      kind: "fact",
      createdAt: fallback.createdAt,
    };
  }
  const text = raw.slice(0, idx).trim();
  let kind: GrudgeKind = "fact";
  let team: string | undefined;
  let wasWrong: boolean | undefined;
  try {
    const meta = JSON.parse(raw.slice(idx + TAG.length).trim());
    if (typeof meta.kind === "string") kind = meta.kind as GrudgeKind;
    if (typeof meta.team === "string") team = meta.team;
    if (typeof meta.wasWrong === "boolean") wasWrong = meta.wasWrong;
  } catch {
    // ignore malformed metadata; keep the text.
  }
  return { id: fallback.id, text, kind, team, wasWrong, createdAt: fallback.createdAt };
}
