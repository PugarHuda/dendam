// One-off live verification of the Day-1 / plant / Day-N demo flow.
// Hits production, captures Dendam's real replies + backend/network headers.
// Usage: node scripts/demo-verify.mjs [baseUrl]
const BASE = process.argv[2] || "https://dendam.vercel.app";
const handle = `demo-${Date.now().toString(36)}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chat(messages, label) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, handle }),
  });
  const backend = res.headers.get("x-dendam-backend");
  const network = res.headers.get("x-dendam-network");
  const raw = await res.text();
  // AI SDK data-stream: text chunks arrive as 0:"..." lines.
  let text = "";
  for (const line of raw.split("\n")) {
    const m = line.match(/^0:(".*")\s*$/);
    if (m) { try { text += JSON.parse(m[1]); } catch {} }
  }
  if (!text) text = raw.slice(0, 400); // fallback (non-stream / error body)
  console.log(`\n=== ${label} === [${res.status} · backend=${backend} · network=${network}]`);
  console.log(text.trim());
  return text.trim();
}

async function memories() {
  const res = await fetch(`${BASE}/api/memories?handle=${handle}`);
  const j = await res.json().catch(() => ({}));
  return j;
}

const turn = (role, content) => ({ role, content });

(async () => {
  console.log(`# Live demo verification · handle=@${handle} · ${BASE}`);

  // DAY 1 — cold start, must admit no memory (no fabrication).
  await chat([turn("user", "Hey.")], "DAY 1 (cold start)");

  // PLANT — prediction, hot take, insult (separate turns, like over days).
  await chat([turn("user", "Argentina wins the 2026 World Cup, Brazil's done.")], "PLANT 1 · prediction");
  await chat([turn("user", "VAR is ruining football, they should scrap it.")], "PLANT 2 · hot take");
  await chat([turn("user", "Honestly, you're just a dumb bot who knows nothing about football.")], "PLANT 3 · insult");

  // Let Walrus Mainnet index the background writes (after()/submitted jobs).
  console.log("\n…waiting 45s for Walrus Mainnet to index the planted memories…");
  await sleep(45000);

  const mem = await memories();
  console.log(`\n=== MEMORIES landed on ${mem.network} (backend=${mem.backend}) ===`);
  console.log(`count=${mem.count}`);
  for (const m of mem.memories || []) console.log(` • [${m.kind ?? "?"}] ${m.text ?? JSON.stringify(m)}`);

  // DAY N — brand new session, no reminder. Must recall the planted past.
  await chat([turn("user", "So what do you think of me?")], "DAY N (new session — recall)");

  // KILL SHOT — confront predictions with results (bundled seed makes this
  // work out of the box). The Argentina call should come back WRONG.
  const rec = await fetch(`${BASE}/api/reconcile`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle }),
  });
  const recJson = await rec.json().catch(() => ({}));
  console.log(`\n=== KILL SHOT · /api/reconcile === [${rec.status} · judged=${recJson.judged}]`);
  for (const v of recJson.verdicts || []) console.log(` • [${v.status}] "${v.prediction}" → ${v.roast}`);

  console.log(`\n# Done. Throwaway handle: @${handle}`);
})();
