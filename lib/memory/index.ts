import { LocalMemoryStore } from "./local";
import { MemWalMemoryStore } from "./memwal";
import { MemoryStore } from "./types";

export * from "./types";

let singleton: MemoryStore | null = null;

function hasMemWalConfig(): boolean {
  return Boolean(
    process.env.MEMWAL_DELEGATE_KEY &&
      process.env.MEMWAL_ACCOUNT_ID &&
      process.env.MEMWAL_SERVER_URL,
  );
}

// Returns the active memory store. Resolution order:
//   1. DENDAM_MEMORY_BACKEND env ("memwal" | "local") forces a choice.
//   2. Otherwise: MemWal if its credentials are present, else local.
export function getMemoryStore(): MemoryStore {
  if (singleton) return singleton;

  const forced = process.env.DENDAM_MEMORY_BACKEND?.toLowerCase();
  const useMemWal =
    forced === "memwal" || (forced !== "local" && hasMemWalConfig());

  if (useMemWal) {
    if (!hasMemWalConfig()) {
      throw new Error(
        "DENDAM_MEMORY_BACKEND=memwal but MEMWAL_DELEGATE_KEY / MEMWAL_ACCOUNT_ID / MEMWAL_SERVER_URL are not all set.",
      );
    }
    singleton = new MemWalMemoryStore({
      delegateKey: process.env.MEMWAL_DELEGATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_SERVER_URL!,
    });
  } else {
    singleton = new LocalMemoryStore();
  }
  return singleton;
}

// A stable per-user namespace. In a real deploy, derive this from auth.
// Here we accept a client-supplied handle so the demo is multi-user.
export function namespaceFor(userHandle: string): string {
  const safe = userHandle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return `wc2026:${safe || "anon"}`;
}

export type MemoryNetwork = "mainnet" | "testnet" | "local";

// Pure classifier (exported for testing).
export function classifyNetwork(
  backend: MemoryStore["backend"],
  serverUrl: string | undefined,
): MemoryNetwork {
  if (backend !== "memwal") return "local";
  return /staging|testnet/i.test(serverUrl || "") ? "testnet" : "mainnet";
}

// Which Walrus network the active store is talking to (drives the UI badge).
export function memoryNetwork(): MemoryNetwork {
  return classifyNetwork(getMemoryStore().backend, process.env.MEMWAL_SERVER_URL);
}
