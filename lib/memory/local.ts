import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "../datadir";
import {
  MemoryRecord,
  MemoryStore,
  RememberInput,
} from "./types";

// Local file-backed memory for development and demos when MemWal
// credentials aren't configured. Stored at data/memories.json keyed by
// namespace. Recall is a simple keyword-overlap ranker — good enough to
// exercise the full UX without Walrus.
//
// ⚠️ This is NOT a valid hackathon submission backend. The submission
// requires memory to live on Walrus Mainnet — use the MemWal adapter.

type DB = Record<string, MemoryRecord[]>;

// Computed lazily so DENDAM_DATA_DIR (used in tests) is honored at call time.
function file(): string {
  return path.join(dataDir(), "memories.json");
}

async function readDB(): Promise<DB> {
  try {
    const buf = await fs.readFile(file(), "utf8");
    return JSON.parse(buf) as DB;
  } catch {
    return {};
  }
}

async function writeDB(db: DB): Promise<void> {
  const f = file();
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(db, null, 2), "utf8");
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function score(query: string, rec: MemoryRecord): number {
  const q = new Set(tokens(query));
  if (q.size === 0) return 0;
  const text = tokens(rec.text + " " + (rec.team ?? "") + " " + rec.kind);
  let hits = 0;
  for (const t of text) if (q.has(t)) hits++;
  return hits;
}

export class LocalMemoryStore implements MemoryStore {
  readonly backend = "local" as const;

  // Serialize writes: the store is a single JSON file, so concurrent
  // read-modify-write would clobber. Chain all writes through one queue.
  private queue: Promise<void> = Promise.resolve();
  private seq = 0;

  async remember(namespace: string, input: RememberInput): Promise<void> {
    const run = this.queue.then(() => this.doRemember(namespace, input));
    this.queue = run.catch(() => {}); // keep the chain alive on error
    return run;
  }

  private async doRemember(
    namespace: string,
    input: RememberInput,
  ): Promise<void> {
    const db = await readDB();
    const list = db[namespace] ?? [];
    const rec: MemoryRecord = {
      id: `${Date.now()}-${this.seq++}`,
      text: input.text,
      kind: input.kind,
      team: input.team,
      wasWrong: input.wasWrong,
      createdAt: new Date().toISOString(),
    };
    list.push(rec);
    db[namespace] = list;
    await writeDB(db);
  }

  async recall(
    namespace: string,
    query: string,
    limit = 8,
  ): Promise<MemoryRecord[]> {
    const db = await readDB();
    const list = db[namespace] ?? [];
    return list
      .map((rec) => ({ rec, s: score(query, rec) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.rec);
  }

  async list(namespace: string, limit = 100): Promise<MemoryRecord[]> {
    const db = await readDB();
    const list = db[namespace] ?? [];
    return [...list].reverse().slice(0, limit);
  }
}
