import { NextResponse } from "next/server";
import { sessionAddress } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the signed-in wallet address (or null). Drives the wallet UI state.
export async function GET(req: Request) {
  return NextResponse.json({ address: sessionAddress(req) });
}
