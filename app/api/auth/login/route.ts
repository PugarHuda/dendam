import { NextResponse } from "next/server";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { makeSession } from "@/lib/auth";
import { loginMessage, LOGIN_MAX_SKEW_MS, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/authShared";
import { clientIp, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Verify a wallet's personal-message signature and, on success, set the session
// cookie. This is what makes the address trustworthy server-side: a guest can
// type any handle, but only the wallet owner can produce this signature.
export async function POST(req: Request) {
  const rl = rateLimit("auth", clientIp(req), 10, 60_000);
  if (!rl.ok) return tooMany(rl);

  const { address, issuedAt, signature } = (await req.json().catch(() => ({}))) as {
    address?: string;
    issuedAt?: string;
    signature?: string;
  };
  if (!address || !issuedAt || !signature) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // 1) Freshness — reject stale or future-dated messages (replay protection).
  const t = Date.parse(issuedAt);
  if (!Number.isFinite(t) || Math.abs(Date.now() - t) > LOGIN_MAX_SKEW_MS) {
    return NextResponse.json({ error: "stale_message" }, { status: 400 });
  }

  // 2) Signature — recover the signer and require it to match the claim.
  const message = loginMessage(address, issuedAt);
  let signer: string;
  try {
    const pubkey = await verifyPersonalMessageSignature(
      new TextEncoder().encode(message),
      signature,
    );
    signer = pubkey.toSuiAddress();
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  if (normalizeSuiAddress(signer) !== normalizeSuiAddress(address)) {
    return NextResponse.json({ error: "address_mismatch" }, { status: 401 });
  }

  const addr = normalizeSuiAddress(address);
  const res = NextResponse.json({ address: addr });
  res.cookies.set(SESSION_COOKIE, makeSession(addr), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
