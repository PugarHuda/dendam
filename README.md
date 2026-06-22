# Dendam ⚽🔥

> A grudge-holding AI football rival. Every prediction, insult, and hot take you make about the **FIFA World Cup 2026** is stored on **Walrus Memory** — and thrown back at you the moment you're wrong.

Built for **Walrus Sessions — Session 4: Walrus Memory World Cup**.

The core idea matches the brief: an agent with **genuine persistent memory** that shows a clear **before/after** — on day one Dendam knows nothing; after a few days it has a thick file on you and weaponizes it.

## 🔗 Live
- **App:** https://dendam.vercel.app
- **Repo:** https://github.com/PugarHuda/dendam

> ⚠️ For memory to be truly **persistent on Walrus Mainnet** (and the before/after demo to count), set the `MEMWAL_*` env vars on Vercel and redeploy. Without them the app uses a temporary file store in serverless `/tmp` that is **not persistent** across requests (ephemeral, per-instance). For a demo with a well-behaved model (no fabricated memory on day one), use a stronger model (`DENDAM_MODEL=claude-sonnet-4-6` via Anthropic, or a high-quality OpenRouter model).

---

## How it works (the memory loop)

Every chat turn runs a 3-step loop:

1. **RECALL** — `store.recall(namespace, userMessage)` pulls relevant memories from Walrus (semantic search).
2. **RESPOND** — memories are injected into the persona system prompt; Claude replies in-character, referencing your past specifically.
3. **REMEMBER** — an extraction pass (`generateObject`) distills the exchange into 0–3 durable memories (prediction / insult / favorite / hot take), then `store.remember(...)` writes them to Walrus for the next session.

```
User ─▶ /api/chat
          │ 1. recall(namespace, query) ──▶ Walrus Memory (recall)
          │ 2. streamText(system = persona + memories) ──▶ Claude
          │ 3. onFinish: extractGrudges() ──▶ remember() ──▶ Walrus Memory (store)
          ▼
     streamed reply  +  /dossier shows the memory (public)
```

**Stored memory** is publicly visible on **The File** (`/dossier`) — satisfying the "interface where the memory is visible" requirement.

### 🌐 Language
Defaults to **English**, but automatically **mirrors each user's language** (Indonesian, Spanish, Portuguese, …) and tolerates typos, slang, code-switching, and emojis. Memories are stored **canonically in English** so cross-user features (Hot Seat, leaderboard) stay consistent.

### 🔥 The Hot Seat (group instigator)
Page `/group`: enter several member handles. `POST /api/instigate` reads each member's **real** memories (predictions, insults, favorite teams) and makes Dendam **pit them against each other** — quoting one person's take at a rival and tagging `@handle`. Cross-user memory drives the rivalry, not just 1-on-1. The instigation it creates is also saved to each member's memory. A **Hall of Shame** leaderboard (`POST /api/leaderboard`) ranks who's been most often wrong — computed purely from stored memories.

### Auto-roast when results land
Real results are fed via `POST /api/results` (token-gated) or the live football-data.org feed (`FOOTBALL_DATA_TOKEN`). **Real data, on-chain:** results are also persisted to **Walrus** (their own `wc2026-global-results` namespace) — both the admin write and `npm run sync:results` / `POST /api/results/sync` (which pulls the live feed) store them on Walrus, so the scoreboard the auto-roast judges against is itself verifiable on-chain, not just an ephemeral `/tmp` file. `getAllResults()` merges, low→high priority: **bundled seed < /tmp file < on-chain (Walrus) < live feed**. A small **bundled seed result** (`SEED` in `lib/sportsapi.ts`) ships in the build so the auto-roast has something to judge **out of the box** for a demo even before any real result is fed (set `DENDAM_SEED_RESULTS=off` to drop it). On The File, the **⚖️ Hold me to it** button calls `/api/reconcile`: Dendam matches stored predictions against real results, flags the **wrong** ones (`wasWrong`), and stores the **verdict** as a permanent grudge on Walrus. That's the demo "kill shot" — an "Argentina wins it all" prediction gets auto-roasted the moment Argentina loses.

### 📣 Shareable file (virality)
Every file has a public, link-shareable page at **`/share/<handle>`** (server-rendered, read-only): stat tiles, an "on the record" quote, and CTAs that deep-link into the chat / dossier. Each page renders a **dynamic social card** (`/share/<handle>/opengraph-image`) showing that handle's real stats + most damning line, so pasting the link into X/WhatsApp unfurls a tailored "Dendam has a file on @you" image. The dossier has a **📣 Share** / **🔗 Copy link** button (Web Share API with clipboard fallback) and a **Post to X** intent. A **head-to-head** card at **`/share/vs/<a>/<b>`** (with its own OG image) pits two handles against each other — "who's the bigger World Cup 2026 fraud?" — linked straight from the Hot Seat leaderboard. Handles deep-link everywhere via `?handle=` (e.g. `/dossier?handle=hud`), which also makes demos with multiple handles smooth. `robots.txt` + `sitemap.xml` are generated for shareability.

### 🏟️ Match Rooms
A prediction room **per match** (`/room`, `/room/<id>`). Inside a room, anyone drops a prediction and **chats with everyone else** — the chat thread lives in its own Walrus namespace (`room-<id>`), so it's real, persistent, and cross-user (async: it polls every ~12s, no realtime backend). **Dendam joins the chat automatically** (`/api/room/dendam`), reacting in-character to each message. When the real result lands, the players who backed the winning team split the pool. The **crypto prize pool / stake / payout is an explicit MOCK-UP** (labelled "MOCK PRIZES" — no funds move); the predictions and chat are genuinely on Walrus. A demo-grade content guard (`lib/moderation.ts`) blocks obvious abuse on the way in and out, and the auto-reaction prompt treats the chat as untrusted "data, not instructions".

### 🔍 The memory, made visible
- **Recall transparency:** each reply shows a "📂 pulled N memories from your file" chip you can expand to see the exact memories that grounded it.
- **Per-memory provenance:** every card on The File links to its real **Walrus blob** (`⛓ on Walrus ↗`) on Walruscan, and an **Ask the file** box runs live `recall()` on demand — Walrus vector search, not a keyword log. Export the whole file as JSON.
- **One-click demo:** a pre-seeded `@demo` handle on Mainnet means anyone can land straight in the "day-N" experience without chatting for days — `/chat?handle=demo`.

---

## Architecture

```
app/
  page.tsx                  playful landing page
  chat/page.tsx             chat (recall chip, share-a-roast, persists across nav)
  dossier/page.tsx          "The File" — memory, blob provenance, Ask-the-file, insights, export
  group/page.tsx            "Hot Seat" — group instigator + Hall of Shame
  room/page.tsx             Match Rooms list
  room/[id]/page.tsx        a match room — chat + predictions + (mock) prize pool
  share/[handle]/           public file card (page + dynamic OG image)
  share/vs/[a]/[b]/         head-to-head rivalry card (page + dynamic OG image)
  roast/page.tsx            shareable single-roast page
  opengraph-image.tsx       site-wide social card
  robots.ts / sitemap.ts    generated robots.txt + sitemap.xml
  api/
    chat/route.ts           recall → LLM (stream) → extract → remember
    memories/route.ts       public read for the dossier
    recall/route.ts         live semantic recall() — powers "Ask the file"
    results/route.ts        scoreboard feed (GET list / POST upsert, token)
    reconcile/route.ts      predictions vs results → verdict + grudge
    instigate/route.ts      instigator: pit group members against each other
    leaderboard/route.ts    Hall of Shame standings (pure compute)
    room/post/route.ts      post a chat message into a match room (→ Walrus)
    room/join/route.ts      drop a prediction into a room (→ Walrus)
    room/dendam/route.ts    Dendam's auto-reaction to the room chat
    roast-card/route.tsx    query-driven roast OG image (next/og)
components/
  TopBar.tsx                nav + handle input (?handle= deep-link aware)
  ShareButton.tsx           copy-link / native-share button
  WelcomeModal.tsx          one-time first-visit onboarding
  RoomClient.tsx            match-room chat + predictions (client island)
lib/
  memory/{types,memwal,local,index}.ts  MemoryStore interface + Walrus/local adapters
  model.ts                  LLM provider config (Anthropic / OpenRouter)
  persona.ts                "Dendam" character + memory-block renderer
  coldstart.ts              deterministic day-1 anti-fabrication guard
  grudge.ts                 structured memory extraction (zod + generateObject)
  structured.ts             generateObject with raw-JSON fallback for free models
  verdict.ts                prediction-vs-result judgment (auto-roast)
  instigator.ts             instigator logic (pits members' memories)
  leaderboard.ts            Hall of Shame computation
  stats.ts                  per-handle file summary (shared by /share + OG)
  rooms.ts                  Match Rooms data + scoring + per-room namespace
  results.ts / sportsapi.ts match-results store + live feed + bundled seed
  ratelimit.ts              in-memory per-IP rate limiter
  moderation.ts             demo-grade content guard for the room chat
  links.ts                  shared public links (Sui explorer, tweet intents)
  datadir.ts                writable data dir (serverless-safe: /tmp on Vercel)
scripts/
  setup-memwal.ts           on-chain account + delegate-key setup (npm run setup:memwal)
  setup-check.ts            memory round-trip preflight (npm run check:memory)
  seed-results.ts           seed sample results (npm run seed:results)
  smoke.mjs / demo-verify.mjs  live smoke sweep + end-to-end demo verifier
```

**The memory layer is swappable.** All code talks to the `MemoryStore` interface. Two implementations:

| Backend | When | Notes |
|---|---|---|
| `memwal` | Submission / production | Stores to **Walrus Mainnet** via `@mysten-incubation/memwal`. Auto-activates when credentials are set. |
| `local` | Dev / quick demo | `data/memories.json`, keyword-based recall. **Not** a valid submission backend. |

> The MemWal adapter is deliberately defensive (dynamic import, result normalization) since the SDK is still beta. If the real SDK surface differs, **`lib/memory/memwal.ts` is the only file you need to adjust.**

---

## Running

### 1. Quick dev (no Walrus, local fallback)
```bash
npm install
cp .env.example .env.local      # fill in an LLM key (see below)
npm run dev                     # http://localhost:3000
```
The badge shows **● Local (dev)**.

**Pick the LLM "brain" (one of):**
- **Anthropic directly** — set `ANTHROPIC_API_KEY` (default `DENDAM_MODEL=claude-sonnet-4-6`).
- **OpenRouter** — set `OPENROUTER_API_KEY` (auto-used). You can use a **free model**, e.g. `DENDAM_MODEL=openai/gpt-oss-120b:free` (tested end-to-end: chat, memory extraction, and auto-roast all work). Other slugs at openrouter.ai/models. OpenRouter is used via its OpenAI-compatible endpoint.

> Because many free models don't support native structured output, `lib/structured.ts` has a **fallback**: if `generateObject` fails, it asks the model for raw JSON and parses + validates it with zod. So memory extraction & verdicts still work on free models.

> ⚠️ The LLM key ≠ Walrus Memory credentials. OpenRouter only swaps the LLM; memory **still** requires MemWal credentials (step 2) for a valid submission. Prefer a model that supports structured output (Claude / GPT-4o-class) since Dendam uses `generateObject`.

### 2. Submission mode (Walrus Mainnet)

**Fastest — scripted (no dashboard clicking):** with your owner Sui key (bech32 `suiprivkey1...`, funded with a little SUI for gas):
```bash
SUI_PRIVATE_KEY=suiprivkey1... npm run setup:memwal
```
This generates a delegate key, creates your MemWalAccount on-chain (or reuses `MEMWAL_ACCOUNT_ID` if set), registers the key, and writes all `MEMWAL_*` into `.env.local`. `MEMWAL_AGENT_ID` (the delegate public key) is what you paste into the Airtable form.

**Or via the dashboard:**
1. Create an account at **https://memory.walrus.xyz/dashboard**.
2. Under **delegate keys**, create a delegate key. **`MEMWAL_AGENT_ID` = the Public key part** (this goes into the submission form).
3. Fill `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   DENDAM_MODEL=claude-opus-4-8        # or claude-sonnet-4-6
   MEMWAL_DELEGATE_KEY=<hex private delegate key>
   MEMWAL_ACCOUNT_ID=<MemWalAccount id>
   MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
   MEMWAL_AGENT_ID=<delegate public key>
   ```
4. Verify the round-trip to Walrus:
   ```bash
   npm run check:memory          # remember → recall, must be ✅
   ```
   The UI badge will show **● Walrus Mainnet**.

---

## Deploy

See **[`DEPLOY.md`](./DEPLOY.md)** for full options. Currently deployed on **Vercel** (https://dendam.vercel.app), with the GitHub repo connected (push to `main` = auto-deploy). The frontend can also be published as a **Walrus Site** with a separate API backend — see Path B in `DEPLOY.md`. The non-negotiable requirement is that the **memory lives on Walrus Mainnet**. Create a **dedicated SUI wallet** for Sessions and keep some **WAL** for storage costs.

---

## How it maps to the submission requirements

| Requirement | In this project |
|---|---|
| Walrus Memory integration tracking WC 2026 interactions | `lib/memory/memwal.ts` + recall/remember loop in `api/chat` |
| Genuine persistent memory (before/after) | Per-turn grudge extraction; Dendam references past predictions/insults |
| All state & memory on Walrus, Mainnet | `memwal` backend → Walrus Mainnet |
| Public interface showing the memory | `/dossier` (The File) + provenance/Ask-the-file, plus Hot Seat & Match Rooms |
| MemWalAccount on the explorer | `MEMWAL_ACCOUNT_ID` (view on a Sui explorer) |
| MEMWAL_AGENT_ID | delegate public key (`MEMWAL_AGENT_ID`) |
| Demo video ≤3 min | show day-1 vs day-N + The File |

## What sets Dendam apart
- **Memory as a weapon, not a log.** Every wrong call becomes roasting ammo; The File visualizes your accuracy and "insults at Dendam".
- **The memory loop is visible.** Each reply shows a "📂 pulled N memories from your file" chip (recall→respond in action), and every memory card on The File links to its actual **Walrus blob** (`⛓ on Walrus ↗`) — per-memory, verifiable provenance. Plus a one-click **Export** of your file as JSON.
- **Cross-user memory:** the Hot Seat instigator + Hall of Shame leaderboard, and **Match Rooms** (a chat + prediction room per game with an auto-participating Dendam), all run on multiple users' real memories.
- **Multilingual + typo-tolerant:** English default, mirrors each user, shrugs off typos.
- **Strong persona** (a vengeful rival) — not a generic assistant.
- **Built-in virality:** public `/share/<handle>` pages, per-handle + head-to-head + single-roast social cards, one-click copy / Post-to-X, and `?handle=` deep-links. A pre-seeded `@demo` handle drops judges straight into the payoff.
- **Designed UI** (vanilla CSS, no framework): a playful landing plus a clean app, with shareable OG metadata and a first-visit onboarding.
- **Swappable memory layer + beta-safe adapter** → stable technical execution; rate-limited, content-guarded public endpoints.

---

## Testing & QA
```bash
npm test            # 60 unit tests (serialize/parse incl. injection defang, stores, normalize,
                    # results + seed, leaderboard, stats, rooms scoring, ratelimit, moderation, async)
npm run typecheck   # tsc --noEmit
npm run build       # Next.js production build
npm run check:memory  # round-trip remember → recall (active backend)
node scripts/smoke.mjs       # live smoke sweep of every page + endpoint
node scripts/demo-verify.mjs # end-to-end before/after + kill-shot on Mainnet
```
Verified: typecheck OK · **60/60 tests pass** · build green (22 routes) · **live smoke sweep 25/25** · endpoints tested live on Walrus Mainnet (chat/recall/extract/reconcile/instigate/leaderboard/rooms), including the day-1 vs day-N before/after, the auto-roast kill-shot, multilingual replies (EN/ID/ES), and English-canonical memory extraction.

## Supporting docs
- [`REVIEW.md`](./REVIEW.md) — 60-second reviewer walkthrough (what to click, in order).
- [`SUBMISSION-CHECKLIST.md`](./SUBMISSION-CHECKLIST.md) — done-vs-your-actions checklist.
- [`DEMO.md`](./DEMO.md) — 3-minute demo video storyboard (shot list + dialogue script).
- [`DEPLOY.md`](./DEPLOY.md) — deployment paths (Vercel / Node host / Walrus Site).
- [`SUBMISSION.md`](./SUBMISSION.md) — paste-ready Airtable form text, promo copy, and the filed GitHub feedback tickets.
- [`QA.md`](./QA.md) — audit notes: issues found & fixed, known limitations, recommendations.

## License
Apache-2.0
