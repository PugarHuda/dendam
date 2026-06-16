import os from "node:os";
import path from "node:path";

// Where the file-based stores (local memory fallback + results board) write.
// Resolved at call time so tests can override via DENDAM_DATA_DIR.
//
// On serverless hosts (Vercel/Lambda) the project filesystem is read-only;
// only the OS temp dir is writable (and ephemeral per-instance). We fall
// back to it there so the app doesn't crash. NOTE: durable memory for the
// submission must use the MemWal/Walrus backend, not these files.
export function dataDir(): string {
  if (process.env.DENDAM_DATA_DIR) return process.env.DENDAM_DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "dendam");
  }
  return path.join(process.cwd(), "data");
}
