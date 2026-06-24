// Record a real demo video of Dendam with Playwright (drives the live UI, so
// the memory is genuinely working on Walrus). Captions are injected on-screen
// so they're baked into the recording and perfectly synced.
//   1. npm start   (in another terminal, or this script assumes localhost:3000)
//   2. node scripts/record-demo.mjs
// Output: .design/dendam-demo.webm (+ .mp4 if ffmpeg is available).
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const BASE = process.env.DEMO_BASE || "http://localhost:3000";
const VDIR = ".design/video";
fs.rmSync(VDIR, { recursive: true, force: true }); // start clean so we grab THIS run's video
fs.mkdirSync(VDIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function caption(page, text) {
  await page.evaluate((t) => {
    let el = document.getElementById("__cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "__cap";
      el.style.cssText =
        "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;" +
        "background:rgba(36,16,70,.88);color:#fff;text-align:center;" +
        "font:700 27px/1.35 ui-sans-serif,system-ui,sans-serif;padding:15px 26px;";
      document.documentElement.appendChild(el);
    }
    el.textContent = t;
  }, text).catch(() => {});
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VDIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // 1) Landing
  await page.goto(BASE, { waitUntil: "networkidle" });
  await caption(page, "Dendam — a World Cup 2026 rival AI that never forgets");
  await sleep(3500);

  // 2) Start the beef → choice modal
  await page.getByRole("button", { name: "Start the beef" }).first().click();
  await sleep(900);
  await caption(page, "Play as a guest, or own your File with a Sui wallet");
  await sleep(3200);

  // 3) Chat as guest
  await page.getByRole("button", { name: /Chat as guest/ }).click();
  await page.waitForURL("**/chat**", { timeout: 15000 }).catch(() => {});
  await sleep(1200);
  // dismiss the welcome modal if it shows
  await caption(page, "Guests chat instantly — just a nickname");
  const gotIt = page.getByRole("button", { name: "Got it" });
  if (await gotIt.isVisible().catch(() => false)) {
    await sleep(1800);
    await gotIt.click().catch(() => {});
  }
  await sleep(700);

  // 4) DAY 1 — fresh handle, admits nothing
  await caption(page, "DAY 1 — a brand-new handle");
  const nick = page.getByPlaceholder("your nickname");
  await nick.fill("rookie").catch(() => {});
  await sleep(1000);
  const composer = page.getByPlaceholder(/Type your prediction/);
  await composer.fill("Hey. First time talking to you.");
  await page.getByRole("button", { name: "Send" }).click();
  await caption(page, "It owns up — no memory, no fake past");
  await sleep(12000);

  // 5) DAY N — a handle it's seen before (@demo is pre-seeded on Mainnet)
  await caption(page, "DAY N — a handle it has seen before");
  await nick.fill("demo").catch(() => {});
  await sleep(1300);
  await composer.fill("what do you remember about me?");
  await page.getByRole("button", { name: "Send" }).click();
  await caption(page, "No reminder — it recalls your picks, takes, even insults");
  await sleep(15000);

  // 6) The File — memory made visible + verifiable
  await page.goto(`${BASE}/dossier?handle=demo`, { waitUntil: "networkidle" });
  await caption(page, "The File — every memory is a real Walrus blob");
  await sleep(3500);
  await page.mouse.wheel(0, 700);
  await sleep(3500);

  // 7) Public Files / Hall of Shame — cross-user memory, verifiable
  await page.goto(`${BASE}/share/budi`, { waitUntil: "networkidle" });
  await caption(page, "Public Files — meet @budi, the reigning World Cup fraud");
  await sleep(4200);
  await page.mouse.wheel(0, 320);
  await caption(page, "Wrong calls stamped WRONG — ranked purely from memory");
  await sleep(4200);

  // 8) Match Rooms — cross-user, Dendam joins
  await page.goto(`${BASE}/room/WC2026-BRA-ARG-QF`, { waitUntil: "networkidle" });
  await caption(page, "Match Rooms — cross-user chat, Dendam jumps in");
  await sleep(5500);

  // 9) Close
  await caption(page, "Live on Walrus Mainnet · dendam.vercel.app");
  await sleep(3500);

  await context.close(); // flushes the video
  await browser.close();

  // find the webm + convert to mp4 if ffmpeg is present
  const webm = fs
    .readdirSync(VDIR)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f: `${VDIR}/${f}`, t: fs.statSync(`${VDIR}/${f}`).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0]?.f;
  const out = ".design/dendam-demo.webm";
  if (webm) fs.copyFileSync(webm, out);
  console.log(`✅ recorded ${out}`);
  try {
    const ffmpeg = require("@ffmpeg-installer/ffmpeg").path;
    const mp4 = ".design/dendam-demo.mp4";
    const r = spawnSync(ffmpeg, ["-y", "-i", out, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], { encoding: "utf8" });
    if (r.status === 0) console.log(`✅ converted ${mp4}`);
    else console.log("(mp4 convert skipped)", (r.stderr || "").slice(-200));
  } catch {
    console.log("(ffmpeg not available — webm only)");
  }
})().catch((e) => {
  console.error("record failed:", e.message);
  process.exit(1);
});
