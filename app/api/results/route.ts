import { createHash, timingSafeEqual } from "node:crypto";
import { addResults, MatchResult } from "@/lib/results";
import { getAllResults } from "@/lib/sportsapi";

export const runtime = "nodejs";

// Constant-time secret comparison (hash first so length never leaks via timing).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// GET — public list of match results (manual/seed merged with the live
// football-data.org feed when FOOTBALL_DATA_TOKEN is set). Powers the feed.
export async function GET() {
  const results = await getAllResults();
  return Response.json({ count: results.length, results });
}

// POST — add/upsert results. Token-gated so only the operator can feed the
// live scoreboard. Set DENDAM_ADMIN_TOKEN and send it as `x-admin-token`.
export async function POST(req: Request) {
  const token = process.env.DENDAM_ADMIN_TOKEN;
  // Fail closed: if no token is configured, this write endpoint is disabled
  // entirely (rather than open to anyone). Seeding in dev goes through the
  // seed:results script, not this route, so this doesn't block local work.
  if (!token) {
    return Response.json({ error: "admin_disabled" }, { status: 503 });
  }
  if (!safeEqual(req.headers.get("x-admin-token") ?? "", token)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { results?: MatchResult[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const incoming = Array.isArray(body.results) ? body.results : [];
  if (incoming.length === 0) {
    return Response.json({ error: "no_results" }, { status: 400 });
  }
  const total = await addResults(incoming);
  if (total === -1) {
    return Response.json({ error: "no_valid_results" }, { status: 400 });
  }
  return Response.json({ ok: true, total });
}
