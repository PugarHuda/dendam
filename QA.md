# 🔍 QA & Audit Notes

A thorough pass over correctness, edge cases, security, performance, and DX.
Status at audit: typecheck OK · 34/34 unit tests · build green (6 API routes) ·
live endpoints verified on Vercel (chat/recall/extract/reconcile/kompor/leaderboard,
multilingual EN/ID/ES) · full pipeline validated on Walrus **mainnet**
(createAccount → addDelegateKey → remember → recall).

## Issues found & FIXED
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | High | `reconcile` judged predictions **sequentially** (one LLM call each) → with many predictions it could exceed Vercel's 60s function limit and time out mid-write. | Bounded-concurrency judging (`mapLimit`, 5 at a time), cap at 12 per call, returns `skipped`. |
| 2 | High | `LocalMemoryStore.remember` did read-modify-write on one shared JSON file → **concurrent writes clobbered** (lost memories, duplicate ids). | Added a write-serializing queue (mutex) + stable sequence ids. Regression test fires 25 concurrent writes and asserts none are lost. |
| 3 | Medium | UI badge always read **"Walrus Mainnet"** even when talking to the testnet relayer. | `classifyNetwork()` / `memoryNetwork()`; chat + memories expose `network`; badge now shows Mainnet / Testnet / Local accurately. |
| 4 | Medium | MemWal account ops threw `"SuiClient not found"` with `@mysten/sui` v2.6+ (client moved to `/jsonRpc`). | `setup-memwal.ts` builds `SuiJsonRpcClient` and passes `suiClient`. Still present in SDK v0.0.7 → filed as feedback ticket #3. |
| 5 | Low | `chat` recalled even on an empty query. | Skip recall when the query is blank. |
| 6 | Low | `Dockerfile` used `--omit=optional`, skipping the `@mysten/*` peers the Walrus backend needs. | Install with optional deps. |
| 7 | High | **Day-1 memory fabrication** — on an empty memory, a weak free model sometimes invented a fake past ("like when you predicted…"), undermining the before/after demo. | **Deterministic cold-start guard** (`lib/coldstart.ts`): on empty recall, generate non-streamed → regex-check for fabricated-past phrasing (multilingual) → retry cooler → hard-coded fallback. Stays free + model-agnostic. Verified clean across EN/ID/ES live. |
| 8 | Medium | `POST /api/results` was open (scoreboard vandalism) when no token set. | Now **fails closed in code**: no `DENDAM_ADMIN_TOKEN` configured → `503 admin_disabled`; otherwise writes require a matching `x-admin-token`. (Dev seeding uses the `seed:results` script, not this route.) |
| 9 | Medium | `kompor` / `leaderboard` loaded each member's memories **sequentially**, and `memwal.list()` ran its 5 theme-recalls sequentially → a group of N members fanned out to ~N×5 serial relayer round-trips, risking the 60s limit (same class as #1). | Shared `mapLimit` util (`lib/async.ts`, reused by `reconcile`): member loads run at concurrency 4, theme-recalls within `list()` run concurrently. Regression tests assert order is preserved and the concurrency cap is honored. |
| 10 | High | `reconcile` and `leaderboard` routes had **no try/catch** around their `store.list()` / `store.remember()` calls → a relayer/network error in the MemWal backend became an unhandled rejection (bare 500, no JSON body) in the serverless handler. | Wrapped both handlers' store calls in try/catch → `500 {error}` with a logged cause; mirrors the `kompor`/`memories` routes. |
| 11 | Medium | `POST /api/results` accepted any array shape and wrote rows verbatim — a missing `id` collapsed all rows into one, a missing/`undefined` `date` later threw in `listResults`' `localeCompare` sort, non-numeric scores corrupted `winnerOf`. | `isValidResult()` validates each row (non-empty `id`/`date`/teams, finite numeric scores); `addResults` drops invalid rows and returns `-1` when none are valid → route replies `400 no_valid_results`. +2 regression tests. |
| 12 | Low | `POST /api/chat` did an unguarded `req.json()` on the hot path → a malformed body 500'd without a JSON error. | Guarded with `.catch(() => ({}))` + a `400 no_messages` check, matching the other routes. |
| 13 | **High** | **Cold-start 504 on Mainnet (live).** `MemWalMemoryStore.remember` blocked on `waitForRememberJob` (~tens of sec of Walrus indexing) **per memory, sequentially**. A fresh-handle chat writes 2-3 grudges → 90-135s → `FUNCTION_INVOCATION_TIMEOUT`, and the write was lost. This hit the **day-1 cold-start path** — the exact moment the demo's before/after hinges on. Reproduced live with a throwaway handle. | `remember()` now submits the job and returns on the relayer's `202 Accepted` without blocking on indexing (the wait can't help a same-request read and isn't needed cross-session — indexing finishes in the background long before the user's next session). The cold-start route also writes via Next's `after()` so the reply flushes before extraction+write run. Verified: cold-start chat now returns ~instantly and the memory appears on Mainnet within ~indexing latency. |
| 14 | Medium | `extractJson` (free-model JSON fallback) used `lastIndexOf(closer)` → trailing prose containing a `}`/`]` after valid JSON grabbed the wrong closer and threw, defeating the fallback. | Replaced with a string-aware **balanced-brace scanner** that finds the matching closer from the first opener (and falls back to the other opener if the first is prose). +8 regression tests. |

## Known limitations & recommendations (NOT bugs)
- **Stronger model still recommended for the recorded demo.** The cold-start guard removes day-1 fabrication on any model, but a stronger model (`DENDAM_MODEL=claude-sonnet-4-6`, or free `nex-agi/nex-n2-pro:free` which tested best) gives sharper, more on-character roasts for the recording. The free default `openai/gpt-oss-120b:free` is fine and fully working.
- **Privacy model.** Handles are public identifiers: anyone can read `/api/memories?handle=X` and call `/api/chat|kompor|leaderboard` for any handle. Intentional for a shareable demo; add real auth + rate-limiting for production. (`/api/results` writes are now token-gated.)
- **Match results: live feed OR manual.** Set `FOOTBALL_DATA_TOKEN` (free, football-data.org) and FINISHED World Cup matches are pulled automatically and merged into the scoreboard + auto-roast — no manual entry (`lib/sportsapi.ts`, 60s in-memory cache, graceful no-op without a token). Without a token, results are fed manually via `POST /api/results` / `npm run seed:results`. Either way, manually-seeded `data/results.json` lives in `/tmp` on serverless (per-instance, wiped on cold start) — the live feed sidesteps this since it re-fetches. **User memory is unaffected either way once `MEMWAL_*` is set** (it's on Walrus).
- **`list()` on the MemWal backend is approximate.** There's no enumerate API, so `list()` does multi-query recall + dedupe; it may miss some memories, which can let `reconcile` re-judge or the leaderboard undercount. Confirmed still missing in SDK v0.0.7 (only semantic `recall` + `restore` counts) → filed as feedback ticket #1.
- **Namespace collisions.** `namespaceFor` maps non-alphanumerics to `_`, so e.g. `a.b` and `a_b` collide. Fine for a demo; derive from real auth in production.
- **Rotate the OpenRouter key.** The key used during development was pasted in chat and is set on Vercel — rotate it and update the Vercel env var before judging.

## What was checked
Correctness of the recall→respond→remember loop; structured-output fallback for
free models; reconcile dedupe + concurrency; results upsert; kompor cross-user
reads; leaderboard math; serverless filesystem safety; multilingual + typo
handling; secret hygiene (`.env.local` gitignored, no keys committed); and the
full on-chain + relayer pipeline on testnet.
