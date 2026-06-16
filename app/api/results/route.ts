import { addResults, listResults, MatchResult } from "@/lib/results";

export const runtime = "nodejs";

// GET — public list of recorded match results (powers the results feed).
export async function GET() {
  const results = await listResults();
  return Response.json({ count: results.length, results });
}

// POST — add/upsert results. Token-gated so only the operator can feed the
// live scoreboard. Set DENDAM_ADMIN_TOKEN and send it as `x-admin-token`.
export async function POST(req: Request) {
  const token = process.env.DENDAM_ADMIN_TOKEN;
  if (token && req.headers.get("x-admin-token") !== token) {
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
  return Response.json({ ok: true, added: incoming.length, total });
}
