# 🎬 Demo Script — Dendam (≤ 3 minutes)

> 🤖 **Shortcut:** `npm start` then `npm run media:record` auto-records a ~85s
> captioned MP4 of this exact before/after flow with Playwright
> (`.design/dendam-demo.mp4`). Use it as-is, or as a base to add your own
> voiceover. The shot list below is for a polished hand-recorded version.


Win the judges on **3 criteria**: Memory Depth & Authenticity (the before/after
moment), Creativity & Flair (a vengeful World Cup rival), Technical Execution
(live on Walrus **Mainnet**).

**Your one weapon: before/after proof.** Day-1 agent (empty, admits it) → plant
a few takes → day-N agent cutting deep with real recall → prove the memory
truly lives on Walrus/Sui.

> ✅ Everything below runs against `dendam.vercel.app` (`network=mainnet`).
> **Guest mode is on**, so you can record the whole thing with just a nickname —
> no wallet needed. The `@demo` / `@budi` files are **pre-seeded on Mainnet**, so
> the "day-N" moment needs zero waiting.

---

## ⚡ Fast path (record in one take) — ~3 min, zero setup

1. **0:00 Hook** — landing `dendam.vercel.app`. VO: *"Most football bots forget
   you the second you close the tab. This one keeps a file."* Click
   **Start the beef** → the choice modal pops up → **Chat as guest** (point out:
   *"no wallet, no friction — but it's still real memory on Walrus"*).
2. **0:15 DAY 1 (empty)** — you're in `/chat`. Top-right, set the nickname to a
   fresh one, e.g. **`@rookie`**. Type **`Hey.`** → Dendam **admits it has nothing
   on you** (no fake history). VO: *"Day one — it owns up. That honesty is the
   trick."*
3. **0:40 DAY N (the money shot)** — change the nickname (top-right) to
   **`demo`**. Type **`what do you remember about me?`** → Dendam instantly dredges
   up the Argentina pick, the Mbappé take, the VAR rant, the "dumb bot" insult.
   **Zoom in.** Click the **📂 pulled N memories** chip → the exact memories it
   recalled. VO: *"Same agent. A handle it's seen before. No reminder — and it
   remembers everything."*
4. **1:15 The File** — open **Memory** (`/dossier`, handle `demo`). Stats, the
   dark **Grudge of the day**, **Ask the file** (`what did I say about Brazil?` →
   live semantic recall). Click **on Walrus ↗** on a card → the real encrypted
   blob. VO: *"Every memory is a real Walrus blob — verifiable, one click."*
5. **1:45 Kill shot** — on The File, the sidebar **Run reconcile / Hold me to
   it** → the Argentina prediction is stamped **WRONG** with a roast, saved back
   on-chain. VO: *"Then the results land — and it calls your bluff automatically."*
6. **2:10 Multiplayer** — **Hall of Shame** (`/group`): type
   `budi, hud, sarah, reyhan, ta` → **Tally the board** → **@budi** crowned the
   reigning fraud, ranked **purely from stored memory** (all real, on-chain).
   *(Optional: Rooms → Brazil vs Argentina → cross-user chat + Dendam jumping in.)*
7. **2:35 Proof** — the **Sui explorer** on the `MemWalAccount`. VO: *"All of it
   ties back to a MemWalAccount on Sui. Anyone can audit it — it's not a chat
   log, it's memory."*
8. **2:50 Close** — logo + link. VO: *"Dendam. Make your call… and live with it."*
   *(Flair: reopen the Start-the-beef modal → "Connect Sui wallet" to show a File
   can be truly wallet-owned.)*

---

## 🎙️ Voiceover (read while you click — ~3 min)

> **[0:00 landing]** "Most football bots forget you the second you close the tab.
> This one keeps a file." *(Start the beef → Chat as guest)*
>
> **[0:15 @rookie]** "Brand-new handle. Watch — it owns up. No fake history. Day
> one, it's got nothing on me."
>
> **[0:40 @demo]** "Now a handle it's seen before. No reminder, no setup —" *(type
> `what do you remember about me?`)* "— and it dredges up my Argentina pick, my
> VAR rant, even the time I called it a dumb bot, and roasts me for all of it.
> These are the exact memories it pulled." *(click the recall chip)*
>
> **[1:15 The File]** "This is the file. Every prediction and insult is a real
> encrypted blob on Walrus — one click and there it is, on-chain. I can even ask
> it in plain English." *(Ask the file: `what did I say about Brazil?`)*
>
> **[1:45 kill shot]** "Then the results land. Argentina lost to the team I wrote
> off — and Dendam stamps it WRONG, automatically."
>
> **[2:10 Hall of Shame]** "It's multiplayer, too — a leaderboard computed purely
> from stored memory. Meet @budi, the reigning World Cup fraud."
>
> **[2:35 Sui]** "All of it lives on Walrus Mainnet, tied to a MemWalAccount on
> Sui. Anyone can verify it."
>
> **[2:50 close]** "Dendam. Make your call… and live with it."

---

## The exact lines (paste-ready)
```
# /chat — DAY 1 (nickname @rookie)
Hey.

# /chat — DAY N (change nickname to @demo)
what do you remember about me?

# The File → Ask the file
what did I say about Brazil?
```
Then: **The File → Run reconcile** (WRONG verdict) · **/group** → `budi, hud, sarah, reyhan, ta` → **Tally the board**.

## Pre-seeded handles (real, on Mainnet — no waiting)
- `@demo` — thick file (Argentina/Mbappé predictions, VAR take, insult, busted verdict)
- `@budi` — the reigning fraud (Hall of Shame #1); also `hud, sarah, reyhan, ta`
- Verify any: `dendam.vercel.app/share/<name>`

## Production notes
- **1080p.** Zoom hard on any reply that cites old memory — that's the score.
- Keep **Walrus Mainnet** provenance in frame (the green badge on The File, the
  Sui explorer tab).
- Label **DAY 1** and **DAY N** with on-screen text — that contrast is the #1
  signal judges look for.
- Recall indexes in a beat on Mainnet; the pre-seeded handles avoid any wait.
- Burn in captions — many judges watch muted.
- Re-verify the flow anytime: `node scripts/demo-verify.mjs` (works again now
  that guests can chat).
