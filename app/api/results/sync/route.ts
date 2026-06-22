import { createHash, timingSafeEqual } from "node:crypto";
import { syncResults } from "@/lib/sportsapi";

export const runtime = "nodejs";
export const maxDuration = 60;

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// POST — pull the live football-data.org feed and persist any new FINISHED
// matches to Walrus (real data → on-chain). Token-gated, and a no-op without a
// FOOTBALL_DATA_TOKEN. Point a cron at this to keep the on-chain scoreboard
// fresh during the tournament.
export async function POST(req: Request) {
  const token = process.env.DENDAM_ADMIN_TOKEN;
  if (!token) return Response.json({ error: "admin_disabled" }, { status: 503 });
  if (!safeEqual(req.headers.get("x-admin-token") ?? "", token)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const r = await syncResults();
    return Response.json({ ok: true, ...r });
  } catch (err) {
    console.error("[dendam] results sync failed:", err);
    return Response.json({ error: "sync_failed" }, { status: 500 });
  }
}
