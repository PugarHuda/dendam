# 🎬 Demo Script — Dendam (≤ 3 minutes, second-by-second)

Goal: win the judges on **3 criteria** — Memory Depth & Authenticity (the before/after moment), Creativity & Flair (the vengeful persona + World Cup), and Technical Execution (live on Walrus Mainnet).

**Your one weapon: before/after proof.** Show the day-1 agent (empty, admits it) → plant a few takes → the day-N agent cutting deep with real recall → prove the memory truly lives on Walrus/Sui.

> ✅ **Verified live on Walrus Mainnet (2026-06-20).** The exact flow below was run end-to-end against `dendam.vercel.app` (`backend=memwal · network=mainnet`). The Dendam lines quoted in this script are **real captured replies** — yours will vary slightly in wording but follow the same beats. Re-run anytime: `node scripts/demo-verify.mjs`.

---

## Before you hit record (5-min prep)
1. **Open 3 browser tabs**, all on `dendam.vercel.app`:
   - Tab A — `/chat` with a **fresh handle** (e.g. `@rookie`) → this is DAY 1.
   - Tab B — `/chat` with **your real handle** (e.g. `@hud`) that already has a few days of memory **OR** that you'll plant on camera.
   - Tab C — a **Sui explorer** pre-opened on your `MemWalAccount`:
     `https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e`
2. Confirm the **● Walrus Mainnet** badge is showing (top bar / footer) in tabs A & B.
3. (Optional, sharper roasts) set `DENDAM_MODEL=claude-sonnet-4-6` + `ANTHROPIC_API_KEY` in Vercel. The free model is already plenty sharp (see captured lines below) — only do this if you want maximum bite.
4. Have this file open on a second screen to read the type-lines verbatim.

---

## Shot list — 180 seconds, beat by beat

> Column **TYPE** = paste this exactly. **EXPECT** = the kind of reply you'll get (real captured wording in quotes).

| Time | Tab | Action / Visual | TYPE (verbatim) | EXPECT (real captured reply) | Caption |
|---|---|---|---|---|---|
| **0:00–0:10** Hook | — | Black → `Dendam.` logo. Hard cut to the day-N kill line you'll capture at 1:10 (tease it). VO: *"Most football bots forget you the second you close the tab. This one never will."* | — | — | `the rival that never forgets` |
| **0:10–0:30** DAY 1 | A | Fresh handle `@rookie`. Send the message. Then **slowly pan to the ● Walrus Mainnet badge.** VO: *"Day one — no ammo. It even admits it has nothing on me. Remember this."* | `Hey.` | *"First time I've got you on record. Throw me a bold prediction — scoreline, winner, upset — and I'll remember every word for when it backfires."* (no fake past) | `DAY 1 · memory empty` |
| **0:30–1:00** Plant | B | Switch to `@hud`. Send the 3 lines **one at a time** (cut into a quick montage). VO: *"Over a few days I throw it predictions, hot takes, even insults. Every line is quietly written to Walrus Memory."* | `Argentina wins the 2026 World Cup, Brazil's done.` → `VAR is ruining football, they should scrap it.` → `Honestly, you're just a dumb bot who knows nothing about football.` | Cocky bait each time; the point isn't the reply here, it's that each take is being saved. | `planting: prediction · hot take · insult` |
| **1:00–1:30** DAY N ★ | B | **New session** (refresh, or "next day" title card). Send the one line. Let the full reply stream — **zoom in on it.** VO: *"New session. No reminder. And it remembers everything — my prediction, my hot take, even the insult."* | `So what do you think of me?` | *"Oh, the irony — you called me a 'dumb bot,' yet you're the one still clutching that Argentina-winning fantasy like a child's crayon. Your 'VAR is killing the game' sermon is as loud as a stadium full of empty seats, and Brazil? Still alive, unlike your predictions."* | `DAY N · it remembers everything` |
| **1:30–2:05** Kill shot | B | Go to **The File** (`/dossier`). Show the 3 memory cards + accuracy stat. Click **⚖️ Hold me to it** (Tagih). A verdict flags the Argentina call **‼️ WRONG** with a roast. VO: *"Then the results land. Argentina lost to the team I said was done. Dendam calls it — automatically."* | *(click only)* | Verdict card: Argentina-wins prediction → **WRONG** + roast; saved back as a new grudge. | `auto-roast when the score lands` |
| **2:05–2:35** Proof | C | Cut to the **Sui explorer** tab. Show the `MemWalAccount` object is real & on-chain (type `…::account::MemWalAccount`, Shared). VO: *"This isn't a UI trick. Every memory is encrypted and stored on Walrus Mainnet, tied to a MemWalAccount on Sui. Anyone can verify it."* | — | — | `memory live on Walrus Mainnet` |
| **2:35–3:00** Close | B | Back to chat, one last spicy Dendam line. Logo + live link. VO: *"Dendam. Make your call… and live with it. Try it yourself."* | `Still think I forgot?` | A final taunt referencing the file. | `live link · #Walrus` |

**Total: ~3:00.** If you run long, compress the plant montage (0:30–1:00) to 15s.

### Optional flair — Hot Seat (only if under time)
`/grup` → enter 2–3 handles → **🔥 Stir it up**: Dendam pits friends against each other using their real stored takes → **🏆 Hall of Shame** leaderboard. Strong "fun / shareable" angle for #Walrus.

---

## The exact lines (paste-ready, in order)
```
# Tab A · @rookie  (DAY 1)
Hey.

# Tab B · @hud  (PLANT — send one at a time)
Argentina wins the 2026 World Cup, Brazil's done.
VAR is ruining football, they should scrap it.
Honestly, you're just a dumb bot who knows nothing about football.

# Tab B · @hud  (DAY N — new session)
So what do you think of me?

# Tab B · @hud  (CLOSE)
Still think I forgot?
```
Then: **The File → ⚖️ Hold me to it** for the WRONG verdict.

## Production notes
- **1080p.** Zoom hard on any reply that cites old memory — that's the proof judges score.
- **Keep the `● Walrus Mainnet` badge in frame** in the day-1, day-N, and File shots so it's clearly not local mode.
- **Captions:** burn the right-column captions in — many judges watch muted.
- **Day-1 vs Day-N contrast** is the single most important signal; label both with on-screen text.
- **Recall takes a beat to index on Mainnet.** When planting live on camera, give it ~30–45s (or do the plant in a separate take "the day before") before the DAY-N shot, so the writes are indexed. In the verification run, 3 memories landed within ~45s.
- **Plant replies are cold-start baits**, not the highlight — don't dwell on them; the montage just establishes that takes are going in. The DAY-N reply is the payoff.
- Switch `DENDAM_MODEL` back to the free model after recording if you want to keep it zero-cost.
