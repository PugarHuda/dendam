import crypto from "node:crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./authShared";

// Server-side session: a stateless, HMAC-signed token `address.exp.sig` stored
// in an httpOnly cookie. Option 1 of the wallet design — the wallet address IS
// the identity; memory still lives in the app's MemWalAccount, just namespaced
// per verified address. No per-user on-chain account / gas needed.

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.MEMWAL_DELEGATE_KEY || // any stable server secret works as a fallback
  "dendam-dev-secret-change-in-prod";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function makeSession(address: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${address}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readSession(token?: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [address, exp, sig] = parts;
  // Constant-time compare to avoid signature-timing leaks.
  const expected = sign(`${address}.${exp}`);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
  return address;
}

// Read the verified wallet address from a request's cookies (or null).
export function sessionAddress(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  );
  return m ? readSession(decodeURIComponent(m[1])) : null;
}
