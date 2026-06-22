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

// Walrus relayer calls (recall/list) can be slow or hiccup on a cold instance,
// so memory-backed checks retry a few times before being treated as a failure.
async function retry(fn, attempts = 4, delayMs = 5000) {
  for (let i = 0; i < attempts; i++) {
    try { if (await fn()) return true; } catch {}
    if (i < attempts - 1) await sleep(delayMs);
  }
  return false;
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
  for (const p of ["/", "/chat", "/dossier", "/group", `/share/${H}`, `/share/vs/${H}/nobody-xyz`, "/roast?by=demo&text=Argentina%20is%20done", "/room", "/room/WC2026-BRA-ARG-QF"]) {
    const { res } = await get(p);
    check(`GET ${p}`, res.status === 200, `status=${res.status}`);
  }

  // ── OG / card images ────────────────────────────────────
  for (const p of ["/opengraph-image", `/share/${H}/opengraph-image`, `/share/vs/${H}/nobody-xyz/opengraph-image`, "/api/roast-card?by=demo&text=busted"]) {
    const { res, ct } = await get(p);
    check(`GET ${p}`, res.status === 200 && ct.startsWith("image/"), `status=${res.status} ${ct}`);
  }

  // ── SEO files ───────────────────────────────────────────
  {
    const { res } = await get("/robots.txt");
    const body = await (await fetch(BASE + "/robots.txt")).text();
    check("GET /robots.txt (has sitemap)", res.status === 200 && /sitemap/i.test(body), `status=${res.status}`);
  }
  {
    const res = await fetch(BASE + "/sitemap.xml");
    const body = await res.text();
    check("GET /sitemap.xml (has urls)", res.status === 200 && body.includes("<urlset") && body.includes("/chat"), `status=${res.status}`);
  }

  // ── Memory / Mainnet (relayer can be slow on cold start → retry) ──
  {
    let last;
    const ok = await retry(async () => {
      const { res, body } = await get(`/api/memories?handle=${H}`);
      last = { res, body };
      return res.status === 200 && body?.backend === "memwal" && body?.network === "mainnet" && body?.count > 0;
    });
    check("GET /api/memories (mainnet, has memories)", ok,
      `status=${last?.res?.status} backend=${last?.body?.backend} network=${last?.body?.network} count=${last?.body?.count}`);
  }

  // ── Results feed + seed ─────────────────────────────────
  {
    const { res, body } = await get("/api/results");
    const hasSeed = (body?.results || []).some((r) => r.id === "WC2026-BRA-ARG-QF");
    check("GET /api/results (seed present)", res.status === 200 && hasSeed, `status=${res.status} count=${body?.count} seed=${hasSeed}`);
  }

  // ── Input guards (should reject — 429 also acceptable if rate-limited) ──
  {
    const { res, body } = await post("/api/chat", {});
    check("POST /api/chat {} → 400/429", [400, 429].includes(res.status), `status=${res.status} ${body?.error ?? ""}`);
  }
  {
    const { res } = await post("/api/instigate", { handles: ["only-one"] });
    check("POST /api/instigate (1 handle) → 400/429", [400, 429].includes(res.status), `status=${res.status}`);
  }
  {
    const { res, body } = await post("/api/results", { results: [] });
    // 503 admin_disabled / 401 unauthorized / 400 no_results / 429 rate-limited
    check("POST /api/results (no token) → 401/503/400/429", [400, 401, 503, 429].includes(res.status), `status=${res.status} ${body?.error ?? ""}`);
  }
  {
    let last;
    const ok = await retry(async () => {
      const { res, body } = await post("/api/leaderboard", { handles: [H] });
      last = { res, body };
      return res.status === 200 && Array.isArray(body?.rows);
    });
    check("POST /api/leaderboard (ok)", ok, `status=${last?.res?.status} rows=${last?.body?.rows?.length}`);
  }

  // ── Semantic recall (Ask the file) + the seeded demo handle ──
  {
    let last;
    const ok = await retry(async () => {
      const { res, body } = await post("/api/recall", { handle: "demo", query: "what do you remember" });
      last = { res, body };
      return res.status === 200 && Array.isArray(body?.memories) && body.memories.length > 0;
    });
    check("POST /api/recall (demo, has matches)", ok, `status=${last?.res?.status} count=${last?.body?.memories?.length}`);
  }
  {
    const { res } = await post("/api/recall", { handle: "demo" });
    check("POST /api/recall (no query) → 400/429", [400, 429].includes(res.status), `status=${res.status}`);
  }

  // ── Match rooms ─────────────────────────────────────────
  {
    const { res } = await post("/api/room/post", {});
    check("POST /api/room/post {} → 400/429", [400, 429].includes(res.status), `status=${res.status}`);
  }
  {
    // Dendam auto-reaction: should return a non-empty in-character line.
    let last;
    const ok = await retry(async () => {
      const { res, body } = await post("/api/room/dendam", {
        teamA: "France", teamB: "Spain",
        messages: [{ handle: "smoke", text: "Spain are bottlers, France walk it" }],
      });
      last = { res, body };
      return res.status === 200 && typeof body?.line === "string" && body.line.length > 0;
    });
    check("POST /api/room/dendam (Dendam reacts)", ok, `status=${last?.res?.status} line="${(last?.body?.line || "").slice(0, 50)}"`);
  }
  // NB: the recall check above already proves @demo is pre-seeded. We don't
  // assert /api/memories?handle=demo here because list() fires ~5 concurrent
  // relayer recalls and the relayer can throttle them to empty under the
  // smoke's own load (a known, documented best-effort limit) — that would
  // flake the run without indicating a real fault.

  console.log(`\n# ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
