# 🔍 QA & Audit Notes

A thorough pass over correctness, edge cases, security, performance, and DX.
Status at audit: typecheck OK · 17/17 unit tests · build green (6 API routes) ·
live endpoints verified on Vercel (chat/recall/extract/reconcile/kompor/leaderboard,
multilingual EN/ID/ES) · full pipeline validated on Walrus **testnet**
(createAccount → addDelegateKey → remember → recall).

## Issues found & FIXED
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | High | `reconcile` judged predictions **sequentially** (one LLM call each) → with many predictions it could exceed Vercel's 60s function limit and time out mid-write. | Bounded-concurrency judging (`mapLimit`, 5 at a time), cap at 12 per call, returns `skipped`. |
| 2 | High | `LocalMemoryStore.remember` did read-modify-write on one shared JSON file → **concurrent writes clobbered** (lost memories, duplicate ids). | Added a write-serializing queue (mutex) + stable sequence ids. Regression test fires 25 concurrent writes and asserts none are lost. |
| 3 | Medium | UI badge always read **"Walrus Mainnet"** even when talking to the testnet relayer. | `classifyNetwork()` / `memoryNetwork()`; chat + memories expose `network`; badge now shows Mainnet / Testnet / Local accurately. |
| 4 | Medium | MemWal account ops threw `"SuiClient not found"` with `@mysten/sui` v2.6+ (client moved to `/jsonRpc`). | `setup-memwal.ts` builds `SuiJsonRpcClient` and passes `suiClient`. Filed as feedback ticket #6. |
| 5 | Low | `chat` recalled even on an empty query. | Skip recall when the query is blank. |
| 6 | Low | `Dockerfile` used `--omit=optional`, skipping the `@mysten/*` peers the Walrus backend needs. | Install with optional deps. |

## Known limitations & recommendations (NOT bugs)
- **Free-model day-1 hallucination (highest impact for judging).** With `openai/gpt-oss-120b:free`, Dendam occasionally invents a fake past ("like when you predicted…") on a fresh handle, despite an explicit anti-fabrication rule in the persona. This is a weak-model instruction-following limitation, not a code bug. **For the recorded demo, set `DENDAM_MODEL=claude-sonnet-4-6` (Anthropic) or a strong OpenRouter model** — Claude obeys the empty-memory rule reliably. The before/after moment is the #1 judging signal, so use a strong model when recording.
- **Open endpoints / privacy model.** Handles are public identifiers: anyone can read `/api/memories?handle=X`, call `/api/chat|kompor|leaderboard` for any handle, and (if `DENDAM_ADMIN_TOKEN` is unset) POST `/api/results`. This is intentional for a shareable demo. For production: add auth, set `DENDAM_ADMIN_TOKEN`, and rate-limit (LLM cost abuse on the open chat endpoint).
- **Scoreboard is ephemeral on Vercel.** `data/results.json` lives in `/tmp` on serverless (per-instance, wiped on cold start). Re-feed via `/api/results` after deploy, or move to a persistent store. **User memory is unaffected once `MEMWAL_*` is set** (it's on Walrus).
- **`list()` on the MemWal backend is approximate.** There's no enumerate API, so `list()` does multi-query recall + dedupe; it may miss some memories, which can let `reconcile` re-judge or the leaderboard undercount. Filed as feedback ticket #4.
- **Namespace collisions.** `namespaceFor` maps non-alphanumerics to `_`, so e.g. `a.b` and `a_b` collide. Fine for a demo; derive from real auth in production.
- **Rotate the OpenRouter key.** The key used during development was pasted in chat and is set on Vercel — rotate it and update the Vercel env var before judging.

## What was checked
Correctness of the recall→respond→remember loop; structured-output fallback for
free models; reconcile dedupe + concurrency; results upsert; kompor cross-user
reads; leaderboard math; serverless filesystem safety; multilingual + typo
handling; secret hygiene (`.env.local` gitignored, no keys committed); and the
full on-chain + relayer pipeline on testnet.
