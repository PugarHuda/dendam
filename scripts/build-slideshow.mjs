// Build a silent captioned slideshow MP4 from the slide PNGs — a backup/teaser
// for the submission (the real DEMO.md walkthrough is the primary video).
// Usage: node scripts/build-slideshow.mjs
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const ffmpeg = require("@ffmpeg-installer/ffmpeg").path;

const DIR = ".design/slides";
const FONT = "C\\:/Windows/Fonts/arialbd.ttf"; // ffmpeg-escaped Windows path
const SECS = 4;

// [file, caption] — no commas/apostrophes (they break the drawtext filter)
const SLIDES = [
  ["s1.png", "Dendam - the World Cup rival that never forgets"],
  ["s2.png", "Play as guest or own it with a Sui wallet"],
  ["s4.png", "The File - every memory a real Walrus blob"],
  ["s5.png", "Wrong calls get stamped WRONG - on-chain"],
  ["s6.png", "Match Rooms - cross-user chat with Dendam"],
];

const clips = [];
SLIDES.forEach(([file, caption], i) => {
  const src = `${DIR}/${file}`;
  if (!fs.existsSync(src)) {
    console.log(`skip missing ${src}`);
    return;
  }
  const out = `${DIR}/clip${i}.mp4`;
  const vf =
    `scale=1280:720:force_original_aspect_ratio=decrease,` +
    `pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x241046,` +
    `drawbox=x=0:y=ih-64:w=iw:h=64:color=0x241046@0.82:t=fill,` +
    `drawtext=fontfile='${FONT}':text='${caption}':fontcolor=white:fontsize=28:` +
    `x=(w-text_w)/2:y=h-46`;
  const r = spawnSync(
    ffmpeg,
    ["-y", "-loop", "1", "-t", String(SECS), "-i", src, "-vf", vf, "-pix_fmt", "yuv420p", "-r", "25", out],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    console.error(`clip${i} failed:\n`, (r.stderr || "").slice(-600));
    process.exit(1);
  }
  clips.push(out);
  console.log(`✓ clip${i} (${caption})`);
});

// Concat the clips
const listFile = `${DIR}/list.txt`;
fs.writeFileSync(listFile, clips.map((c) => `file '${c.split("/").pop()}'`).join("\n"));
const final = ".design/dendam-slideshow.mp4";
const r = spawnSync(
  ffmpeg,
  ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", final],
  { encoding: "utf8" },
);
if (r.status !== 0) {
  console.error("concat failed:\n", (r.stderr || "").slice(-600));
  process.exit(1);
}
console.log(`\n✅ ${final} (${SLIDES.length * SECS}s, silent, captioned)`);
