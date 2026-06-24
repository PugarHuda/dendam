import { NextResponse } from "next/server";
import { sessionAddress, guestAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the signed-in wallet address (or null) + whether guests may chat
// without a wallet. Drives the wallet UI + the connect gate.
export async function GET(req: Request) {
  return NextResponse.json({ address: sessionAddress(req), allowGuest: guestAllowed() });
}
