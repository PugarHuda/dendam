# 🎬 Demo Video Storyboard — Dendam (≤ 3 minutes)

Goal of the video: win the judges on **3 criteria** — Memory Depth & Authenticity (the before/after moment), Creativity & Flair (the vengeful persona + World Cup), and Technical Execution (live on Walrus Mainnet).

**Your main weapon: before/after proof.** Skip the theory — show the day-1 agent (empty) then the day-N agent (cutting deep with real memory), and close with proof the memory truly lives on Walrus/Sui.

> Before recording: actually use Dendam for **several real days** with one handle (e.g. `@hud`) so its memory file is real, not staged. Run `npm run seed:results` (or feed real results) so "Hold me to it" has material. The backend must show **● Walrus Mainnet** while recording.

---

## Shot list (target 180 seconds)

| Time | Visual / Action | Voiceover | On-screen text |
|---|---|---|---|
| **0:00–0:12** · Hook | Black screen → `Dendam.` logo appears. Quick cut to one of the spiciest replies from chat history. | "Most football chatbots forget who you are every time you close the tab. This one… never will." | `Dendam — the rival that never forgets` |
| **0:12–0:35** · DAY 1 (before) | Open an incognito tab / new handle `@rookie`. Send: "Hey." Dendam replies cocky but **admits it knows nothing** about you. Point at the **● Walrus Mainnet** badge. | "Day one, Dendam has no ammo. It even admits it doesn't know me. Remember this — we'll come back." | `DAY 1 · memory empty` |
| **0:35–1:05** · Planting memory | Switch to your main handle `@hud`. Type a few messages, as if over days: (1) "Argentina wins it all, Brazil's done 😎" (2) "VAR is ruining football." (3) "You're just a dumb bot who knows nothing about football." | "Over a few days I throw predictions, hot takes, even insults at it. Every key line is quietly saved to Walrus Memory." | `planting: prediction · hot take · insult` |
| **1:05–1:40** · DAY N (after) — the key moment | New session (refresh / next day). Type: "So what do you think?" Dendam immediately cuts deep: cites the Argentina prediction, dredges up the "dumb bot" insult, and the inconsistency. | "New session, the next day. Without any reminder — it remembers everything. My predictions, my hot takes, even my insults. **This was impossible on day one.**" | `DAY N · it remembers everything` |
| **1:40–2:15** · Kill shot: results land | Open **The File** → click **⚖️ Hold me to it**. The score `Argentina 1-2 Brazil` is recorded. A verdict appears: the "Argentina wins it all" prediction flagged **‼️ WRONG** + a roast. | "Then the results land. Argentina lost to Brazil — the team I said was 'done'. Dendam calls me out. Automatically." | `auto-roast when the score lands` |
| **2:15–2:40** · Memory proof (Walrus) | Scroll The File: stats (wrong calls, insults), memory cards. Cut to a **Sui explorer** showing the `MemWalAccount` object. | "This isn't a UI trick. Every memory is encrypted and stored on Walrus Mainnet, tied to a MemWalAccount object on Sui. Anyone can verify it." | `memory live on Walrus Mainnet` |
| **2:40–3:00** · Close | Back to chat, one final spicy reply from Dendam. Logo + link. | "Dendam. Make your call… and live with it. Try it yourself." | `live link · #Walrus` |

### Optional flair: the Hot Seat (if you have time)
Show `/grup` with a couple of handles → **🔥 Stir it up** → Dendam pits two friends against each other using their real takes, then the **🏆 Hall of Shame** leaderboard. Great for the "shareable / fun" angle.

---

## Production notes
- **Record at 1080p**, portrait/landscape per platform. Zoom in when showing replies that reference old memory — that's the core proof.
- **Emphasize the day-1 vs day-N contrast** with on-screen labels; judges explicitly look for this signal.
- **Show the `● Walrus Mainnet` badge** in several shots so it's clearly not local mode.
- **Sui explorer**: pre-open the `MemWalAccount` tab (use `MEMWAL_ACCOUNT_ID`) before recording for a smooth transition.
- **Captions**: add the on-screen text (right column) as captions — many judges watch muted.
- **Duration**: keep it ≤ 3 minutes. If tight, cut the "planting memory" part into a 10-second montage.
- **Language**: Dendam defaults to English and mirrors the user — you can demo in English or your own language (it understands both).
- **Sharper roasts for the recording (optional)**: the free model (`openai/gpt-oss-120b:free`) is fine, but for the cleanest, most on-character cuts while filming, point Dendam at Claude — set `ANTHROPIC_API_KEY` and `DENDAM_MODEL=claude-sonnet-4-6` (provider auto-switches to Anthropic; no code change — see `lib/model.ts`). Cold-start guard, recall, and auto-roast all behave the same; only the prose gets sharper. Switch back to the free model after recording if you want to keep it zero-cost.

## Sample dialogue script (paste-ready while recording)
**Day 1 (@rookie):**
> You: `Hey`
> Dendam: *(cocky, but admits it has no record of you yet — baits a prediction)*

**Planting (@hud), send in order:**
> `Argentina wins the 2026 World Cup, Brazil's done.`
> `VAR is ruining football, they should scrap it.`
> `Honestly, you're just a dumb bot who knows nothing about football.`

**Day N (@hud, new session):**
> You: `So what do you think?`
> Dendam: *(must reference Argentina-champions, dredge up "dumb bot", and/or VAR — proof of recall)*

**Kill shot:** The File → ⚖️ Hold me to it → verdict "Argentina wins it all" = ‼️ WRONG.
