// Shared auth constants + the exact message a user signs. No Node APIs here so
// it's safe to import from client components too.

export const SESSION_COOKIE = "dendam_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)
export const LOGIN_MAX_SKEW_MS = 5 * 60 * 1000; // signed message must be fresh

// The human-readable message the wallet signs to prove control. It carries the
// address + an issued-at timestamp so the server can reject stale/replayed
// signatures. No transaction, no gas — this is a personal-message signature.
export function loginMessage(address: string, issuedAt: string): string {
  return [
    "Dendam — sign in to claim your File.",
    "",
    `Address: ${address}`,
    `Issued: ${issuedAt}`,
    "",
    "This only proves you control this wallet. No transaction, no gas.",
  ].join("\n");
}

export function shortAddress(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
