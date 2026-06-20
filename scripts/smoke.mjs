// Live QA smoke sweep. Waits for the latest deploy (the bundled seed result
// appearing in /api/results) then checks every page + endpoint.
// Usage: node scripts/smoke.mjs [baseUrl]
const BASE = process.argv[2] || "https://dendam.vercel.app";
const H = "demo-mql7bgwq";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  ok ? pass++ : fail++;
}

async function get(path) {
  const res = await fetch(BASE + path);
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : null;
  return { res, ct, body, headers: res.headers };
}
async function post(path, json, headers = {}) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(json),
  });
  const body = await res.json().catch(() => null);
  return { res, body };
}

(async () => {
  // Wait (up to ~3 min) for the new deploy: seed result present in the feed.
  let deployed = false;
  for (let i = 0; i < 12; i++) {
    try {
      const { body } = await get("/api/results");
      if ((body?.results || []).some((r) => r.id === "WC2026-BRA-ARG-QF")) { deployed = true; break; }
    } catch {}
    await sleep(15000);
  }
  console.log(`# Deploy with bundled seed live: ${deployed ? "yes" : "NOT YET (checking current anyway)"}\n`);

  // ── Pages ───────────────────────────────────────────────
  for (const p of ["/", "/chat", "/dossier", "/grup", `/share/${H}`]) {
    const { res } = await get(p);
    check(`GET ${p}`, res.status === 200, `status=${res.status}`);
  }

  // ── OG images ───────────────────────────────────────────
  for (const p of ["/opengraph-image", `/share/${H}/opengraph-image`]) {
    const { res, ct } = await get(p);
    check(`GET ${p}`, res.status === 200 && ct.startsWith("image/"), `status=${res.status} ${ct}`);
  }

  // ── Memory / Mainnet ────────────────────────────────────
  {
    const { res, body } = await get(`/api/memories?handle=${H}`);
    check("GET /api/memories (mainnet, has memories)",
      res.status === 200 && body?.backend === "memwal" && body?.network === "mainnet" && body?.count > 0,
      `status=${res.status} backend=${body?.backend} network=${body?.network} count=${body?.count}`);
  }

  // ── Results feed + seed ─────────────────────────────────
  {
    const { res, body } = await get("/api/results");
    const hasSeed = (body?.results || []).some((r) => r.id === "WC2026-BRA-ARG-QF");
    check("GET /api/results (seed present)", res.status === 200 && hasSeed, `status=${res.status} count=${body?.count} seed=${hasSeed}`);
  }

  // ── Input guards (should reject) ────────────────────────
  {
    const { res, body } = await post("/api/chat", {});
    check("POST /api/chat {} → 400", res.status === 400, `status=${res.status} ${body?.error ?? ""}`);
  }
  {
    const { res } = await post("/api/kompor", { handles: ["only-one"] });
    check("POST /api/kompor (1 handle) → 400", res.status === 400, `status=${res.status}`);
  }
  {
    const { res, body } = await post("/api/results", { results: [] });
    // 503 admin_disabled (no token) OR 401 unauthorized (token set, none sent) OR 400 no_results
    check("POST /api/results (no token) → 401/503/400", [400, 401, 503].includes(res.status), `status=${res.status} ${body?.error ?? ""}`);
  }
  {
    const { res, body } = await post("/api/leaderboard", { handles: [H] });
    check("POST /api/leaderboard (ok)", res.status === 200 && Array.isArray(body?.rows), `status=${res.status} rows=${body?.rows?.length}`);
  }

  console.log(`\n# ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
