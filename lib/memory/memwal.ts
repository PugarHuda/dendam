import { mapLimit } from "../async";
import {
  MemoryRecord,
  MemoryStore,
  RememberInput,
  parseMemory,
  serializeMemory,
} from "./types";

// Adapter over the Walrus Memory SDK (@mysten-incubation/memwal).
//
// The SDK is in beta, so this adapter is intentionally defensive:
//  - it imports the package dynamically (it's an optional dependency),
//  - it caches one MemWal client per namespace (the SDK scopes memory to
//    an owner + namespace boundary, set at create time),
//  - it normalizes the recall result across a few plausible shapes.
//
// If the real SDK surface differs from the assumptions below, this is the
// ONE file to adjust — everything else talks to the MemoryStore interface.

export interface MemWalConfig {
  delegateKey: string; // hex private delegate key (server-only secret)
  accountId: string; // MemWalAccount id
  serverUrl: string; // relayer endpoint
}

// `MemWal.create(...)` returns an opaque client; we keep it loosely typed
// because the package may not ship types in every environment.
type MemWalClient = any; // eslint-disable-line @typescript-eslint/no-explicit-any

// How long a list() result is reused per namespace (per serverless instance).
// list() fans out ~5 relayer recalls; the dossier / share / leaderboard / vs
// pages each call it on every request, so a burst of clicks fired dozens of
// concurrent recalls and rate-limited the relayer into returning empty sets.
// New memories take tens of seconds to index anyway, so a brief cache doesn't
// change observable freshness. Only non-empty results are cached (so a
// transient empty/throttled read isn't pinned).
const LIST_TTL_MS = 15_000;

export class MemWalMemoryStore implements MemoryStore {
  readonly backend = "memwal" as const;
  private clients = new Map<string, Promise<MemWalClient>>();
  private listCache = new Map<string, { at: number; data: MemoryRecord[] }>();

  constructor(private cfg: MemWalConfig) {}

  private getClient(namespace: string): Promise<MemWalClient> {
    let client = this.clients.get(namespace);
    if (!client) {
      client = this.createClient(namespace);
      this.clients.set(namespace, client);
    }
    return client;
  }

  private async createClient(namespace: string): Promise<MemWalClient> {
    // Dynamic import keeps the dependency optional + server-only.
    const mod: any = await import("@mysten-incubation/memwal"); // eslint-disable-line
    const MemWal = mod.MemWal ?? mod.default?.MemWal ?? mod.default;
    if (!MemWal?.create) {
      throw new Error(
        "MemWal SDK not found or has an unexpected shape. Install @mysten-incubation/memwal.",
      );
    }
    return MemWal.create({
      key: this.cfg.delegateKey,
      accountId: this.cfg.accountId,
      serverUrl: this.cfg.serverUrl,
      namespace,
    });
  }

  async remember(namespace: string, input: RememberInput): Promise<void> {
    const client = await this.getClient(namespace);
    const payload = serializeMemory(input);
    // Submit the remember job and return as soon as the relayer accepts it.
    // We deliberately do NOT block on waitForRememberJob: Walrus indexing
    // takes tens of seconds, which (a) is far longer than any single request
    // so it can't help a same-request read anyway, and (b) stacked per-memory
    // and sequentially (chat writes 2-3 grudges; reconcile writes N verdicts)
    // it blew past the 60s serverless limit — observed live as a cold-start
    // FUNCTION_INVOCATION_TIMEOUT (504) that ALSO lost the write. Cross-session
    // recall — the real use case — sees the memory once the relayer finishes
    // indexing in the background, long before the user returns next session.
    await client.remember(payload);
  }

  async recall(
    namespace: string,
    query: string,
    limit = 8,
  ): Promise<MemoryRecord[]> {
    const client = await this.getClient(namespace);
    const result = await client.recall({ query, limit });
    return normalize(result, limit);
  }

  async list(namespace: string, limit = 100): Promise<MemoryRecord[]> {
    const cached = this.listCache.get(namespace);
    if (cached && Date.now() - cached.at < LIST_TTL_MS) {
      return cached.data.slice(0, limit);
    }
    const recs = await this.computeList(namespace, limit);
    // Only cache a real result — never pin an empty/throttled read.
    if (recs.length) this.listCache.set(namespace, { at: Date.now(), data: recs });
    return recs;
  }

  private async computeList(namespace: string, limit: number): Promise<MemoryRecord[]> {
    const client = await this.getClient(namespace);
    // Prefer a real list API if the SDK exposes one.
    if (typeof client.list === "function") {
      try {
        const result = await client.list({ limit });
        const recs = normalize(result, limit);
        if (recs.length) return recs;
      } catch {
        // fall through to query-based listing
      }
    }
    // Otherwise approximate a full listing by recalling across themes and
    // de-duplicating. Covers the public "The File" dossier well enough.
    const themes = [
      "world cup match predictions",
      "insults and trash talk from the user to Dendam",
      "the user's favorite and hated teams",
      "the user's hot takes about football",
      "the user's predictions that turned out wrong",
    ];
    // Run the theme recalls concurrently — they're independent queries, and
    // doing them sequentially multiplies per-handle latency 5x (which compounds
    // when callers like the leaderboard/kompor list several handles).
    const perTheme = await mapLimit(themes, themes.length, (q) =>
      this.recall(namespace, q, limit),
    );
    const seen = new Map<string, MemoryRecord>();
    for (const recs of perTheme) {
      for (const r of recs) seen.set(r.text, r);
    }
    return [...seen.values()].slice(0, limit);
  }
}

// Normalize the many shapes a beta SDK might return into MemoryRecord[].
// Exported for unit testing.
export function normalize(result: any, limit: number): MemoryRecord[] {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const items: any[] =
    (Array.isArray(result) && result) ||
    result?.memories ||
    result?.results ||
    result?.items ||
    result?.data ||
    [];
  const out: MemoryRecord[] = [];
  for (let i = 0; i < items.length && out.length < limit; i++) {
    const item = items[i];
    const raw: string =
      typeof item === "string"
        ? item
        : item?.text ?? item?.content ?? item?.memory ?? "";
    if (!raw) continue;
    const id = String(item?.id ?? item?.memory_id ?? `mem-${i}`);
    const createdAt = String(
      item?.createdAt ?? item?.created_at ?? item?.timestamp ?? "",
    );
    out.push(parseMemory(raw, { id, createdAt }));
  }
  return out;
}
