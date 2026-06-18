# 📋 Submission Text — Airtable (Walrus Sessions S4)

Copy-paste into the form: https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO
Fill the `<...>` placeholders with your data before submitting.

---

### Project name
```
Dendam
```

### Please select the session
```
Session 4 — Walrus Memory World Cup
```

### Country
```
Indonesia
```

### Project description (one line)
```
A grudge-holding AI football rival: it remembers your World Cup 2026 predictions, hot takes, and trash talk across sessions via Walrus Memory, then calls you out when your prediction is wrong.
```

---

### Please describe the workflow and functionalities of your project *
```
Dendam is an opinionated football rival for the FIFA World Cup 2026 whose memory runs 100% on Walrus Memory.

Every interaction is a 3-step loop:
1) RECALL — before replying, Dendam calls recall() on Walrus to pull relevant memories about the user (past predictions, insults, favorite team, hot takes).
2) RESPOND — those memories are injected into the persona prompt; Claude replies in-character, referencing the user's past specifically and confronting inconsistencies.
3) REMEMBER — after replying, a structured extraction pass distills the exchange into 0–3 durable memories, then remember() writes them to Walrus for the next session.

Auto-roast: real match results are fed into the system. The "Hold me to it" button matches stored predictions against real results; wrong predictions are flagged and a roasting verdict is stored as a permanent memory on Walrus.

Group mode (Hot Seat): Dendam reads several users' memories at once and pits them against each other (an instigator), plus a "Hall of Shame" leaderboard of who's been most often wrong. It defaults to English but automatically mirrors each user's language and tolerates typos.

The public interface (The File) shows the full memory, stats (wrong calls, insult count), verdicts, and the scoreboard — so the "memory in action" is genuinely visible.

Before/after example: Day 1, a fresh handle → Dendam admits it knows nothing about the user. After a few days of predictions & trash talk → in a new session Dendam immediately cuts deep using old predictions and insults — something impossible on day one.
```

### Which features set your solution apart from the rest? *
```
1) Memory used as a WEAPON, not just a log. Every wrong prediction becomes roasting ammo; The File visualizes the user's accuracy and "insults at Dendam".

2) An explicit, demonstrable before/after loop. Per-turn structured memory extraction + cross-session recall make the day-N agent clearly different from day-1. That's exactly the signal judges look for.

3) Result-triggered auto-roast. When World Cup scores land, Dendam automatically matches the user's predictions against reality and stores the verdict as a permanent grudge on Walrus.

4) Stable technical execution: a swappable memory layer (MemoryStore interface) with a beta-safe Walrus Memory adapter (dynamic import + result normalization). Includes unit tests (24 passing), a memory round-trip preflight, bounded-concurrency fan-out to stay under serverless limits, and a green production build.

5) A strong, shareable persona (a vengeful rival) — not a generic assistant.

6) "Instigator" mode (Hot Seat): Dendam stirs the pot between group members by pitting their ACTUALLY-stored predictions & insults against each other — cross-user memory driving rivalries, highly shareable. Plus a "Hall of Shame" leaderboard (who's most often wrong), computed purely from memory.

7) Multilingual & typo-tolerant: defaults to English, but automatically mirrors each user's language (Indonesian, Spanish, etc.) and understands typos/slang/emoji. Memories are stored canonically in English so cross-user features (instigator, leaderboard) stay consistent.
```

---

### Feedback (about building on Walrus) *
```
What worked well:
- The recall/remember concept fits agentic use cases perfectly — the "owner + namespace" mental model is intuitive.
- Fast initial setup (npm/pip SDK), and tying memory to an on-chain object (MemWalAccount) gives a real sense of being verifiable.
- The SDK has matured fast: by v0.0.7 the TypeScript types fully describe recall()/remember() responses (RecallResult/RecallMemory, the remember job state machine), and namespace can be passed per-call as well as at create() — so the response-shape and namespace ambiguities we hit early on are now resolved in the types.

Challenges that remain (verified against SDK v0.0.7):
- There is still no "list/enumerate" API that returns a namespace's stored memories. recall() is semantic-only and restore() returns counts (restored/skipped/total), not the texts — and is explicitly single-shot with no pagination cursor. To build a full memory dashboard ("The File") we approximate enumeration with multi-query recall + dedupe.
- Read-your-writes consistency after waitForRememberJob() isn't documented — is a recall() immediately after the job reaches "done" guaranteed to see the new memory? We block on waitForRememberJob to be safe.
- On-chain account ops (createAccount/addDelegateKey) still throw "SuiClient not found" on @mysten/sui v2.6+ unless you pass suiClient yourself — and the docstring claims the SDK "will create one internally," which is now misleading on a fresh install (peer >=2.5.0 pulls v2.18).

DX suggestions:
- Add a method to list memories per namespace with pagination (decrypted text, not just restore() counts).
- Document read-your-writes consistency after waitForRememberJob.
- Either auto-detect the v2.6+ Sui client internally or update the docstring/quickstart to say suiClient is required.
(GitHub ticket details below.)
```

### Feedback on using Walrus Memory (GitHub tickets) *
> FILED in the MystenLabs/MemWal repo. Drafts were re-verified against SDK v0.0.7 — the old recall-schema and namespace tickets are now resolved upstream (dropped), and two of the remaining items overlapped with active community issues, so we contributed there instead of opening duplicates.
```
1. [bug] createAccount/addDelegateKey throw "SuiClient not found" on @mysten/sui v2.6+ despite peer >=2.5.0 (NEW ISSUE)
   → https://github.com/MystenLabs/MemWal/issues/300
2. [feature] query-less list/enumerate primitive for a namespace (leaderboard/dashboard completeness) — contributed to the existing truncation issue #271
   → https://github.com/MystenLabs/MemWal/issues/271#issuecomment-4738923047
3. [docs] read-your-writes consistency guarantee after waitForRememberJob — contributed to the existing indexing-status issue #272
   → https://github.com/MystenLabs/MemWal/issues/272#issuecomment-4738923217

(The MEMWAL_AGENT_ID-vs-delegate-key item is a dashboard UX note, not an SDK bug — folded into the prose Feedback section above rather than filed as code-repo noise.)
```

---

### Technical fields (fill in after deploy)
```
Link to your deployed agent:                            https://dendam.vercel.app
GitHub:                                                 https://github.com/PugarHuda/dendam
Link to the explorer showing your MemWalAccount object: https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e
Your MEMWAL_AGENT_ID:                                   37891bc6e27b72ff2a133dbe833de6ceb5d4f7ee215caeaf369e4eee84ddf57d
DeepSurge project Link:                                 <DeepSurge URL, mainnet>
Project Link (URL):                                     https://dendam.vercel.app
SUI address:                                            0xed1e706c3fc3b11337a966a598785fa2da4190368b9a9789d4d99fca9c46d65e
X tweet link:                                           <#Walrus tweet link>
Demo video:                                             <upload, follow DEMO.md, ≤3 min>
```
> NOTE: for memory to be "live on Walrus Mainnet" (not Vercel's ephemeral /tmp), set `MEMWAL_*` on Vercel and redeploy — see DEPLOY.md Path 0.

---

## Promo copy (paste-ready)

### Tweet/X (#Walrus) — required in the form
```
Meet Dendam 🔥⚽ — a FIFA World Cup 2026 rival AI that NEVER forgets.

Every prediction & hot take you make is stored on Walrus Memory, then thrown back when you're wrong. It even stirs up your group chat.

Day 1 it knows nothing. Day 5 it has a FILE on you.

#Walrus
https://dendam.vercel.app
```

Optional follow-up thread (reply):
```
2/ Real persistent memory on @WalrusProtocol Mainnet — not a chat log.
• Predictions auto-roasted when results land
• "Hall of Shame" leaderboard for your group
• Speaks your language (EN default, mirrors yours), shrugs off typos
Try it 👉 dendam.vercel.app
```

### DeepSurge project description
```
Dendam is a grudge-holding football rival for the FIFA World Cup 2026, powered by genuine persistent memory on Walrus.

Every prediction, hot take, and bit of trash talk you throw at Dendam is distilled into structured memories and stored on Walrus Memory (Mainnet), tied to a MemWalAccount object on Sui. Before every reply, Dendam recalls what it knows about you and uses it — confronting your contradictions, dredging up old claims, and roasting predictions the moment real match results prove them wrong.

It's built to show a clear before/after: on day one Dendam knows nothing; after a few days it has a thick file on you and weaponizes it.

Beyond 1-on-1, the Hot Seat mode turns Dendam into a group instigator — reading several users' real memories and pitting them against each other — plus a "Hall of Shame" leaderboard ranking who's been most wrong. It defaults to English but automatically mirrors each user's language and tolerates typos/slang.

Public interface (The File) makes the memory visible: full memory log, verdicts, accuracy stats, and the live scoreboard. Live: https://dendam.vercel.app · Code: https://github.com/PugarHuda/dendam
```

---

## DRAFT GITHUB TICKETS (repo: MystenLabs/MemWal)
> Re-verified against installed SDK **v0.0.7** (June 2026). Two earlier drafts are now resolved upstream and have been REMOVED so we don't file noise:
> - ~~recall() return schema~~ — now fully typed in `dist/types.d.ts` (`RecallResult { results: RecallMemory[]; total }`, `RecallMemory { blob_id; text; distance }`) with a worked `@example` in `memwal.d.ts`.
> - ~~namespace create-vs-per-call~~ — types now show `namespace?` is accepted per call on `remember`/`recall`/`rememberBulk` and defaults from `MemWalConfig`, so the multi-user pattern is answerable from the types.
> File only the three below (plus the dashboard DX note).

**Ticket 1 — [feature] List/enumerate memories for a namespace**
> There's still no API that returns the stored memories of a namespace. `recall(query)` is semantic-only, and `restore(namespace, limit)` returns counts (`restored`/`skipped`/`total`) — not the texts — and its own docstring notes it's single-shot with "No pagination cursor." Building a memory dashboard therefore requires enumerating everything; we approximate it with multi-query `recall` + dedupe (see `lib/memory/memwal.ts` `list()`). Request a `list({ namespace, limit, cursor })` that returns decrypted memories with pagination.

**Ticket 2 — [docs] read-your-writes consistency after `waitForRememberJob`**
> `remember()` returns `{ job_id, status }` and `waitForRememberJob()` resolves at a terminal `done` state (the job state machine is well documented in v0.0.7 — thank you). What's still unspecified: is a `recall()` issued immediately after the job reaches `done` *guaranteed* to see that new memory, or can the vector index lag? Our adapter blocks on `waitForRememberJob` before returning to be safe; a one-line consistency guarantee in the docs would let callers skip that wait when they don't need it.

**Ticket 3 — [bug] account ops throw "SuiClient not found" on `@mysten/sui` v2.6+ despite peer `>=2.5.0`**
> In v0.0.7, `createAccount`/`addDelegateKey` (`dist/account.js`) still fall back to `const { SuiClient } = await import("@mysten/sui/client")` when `opts.suiClient` is omitted. On `@mysten/sui` v2.6+ that export is gone (the client moved to `@mysten/sui/jsonRpc` as `SuiJsonRpcClient`), so the call throws `"SuiClient not found. For @mysten/sui v2.6.0+, pass suiClient in opts."`. Because `peerDependencies` declares `@mysten/sui >=2.5.0`, a fresh install pulls v2.18 and breaks out of the box. Two extra papercuts: (a) the `suiClient?` docstring says the SDK "will create one internally if omitted," which is misleading on v2.6+; (b) the internal fallback URLs are hardcoded fullnodes. Workaround that works for us: build `new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(network) })` and pass it as `suiClient`. Repro + fix in our setup script: https://github.com/PugarHuda/dendam (scripts/setup-memwal.ts).

**Ticket 4 — [dx] Clarify `MEMWAL_AGENT_ID` vs delegate key in the dashboard**
> The submission form says `MEMWAL_AGENT_ID` is the "Public key part" of the delegate key. The dashboard could label this explicitly (e.g. "MEMWAL_AGENT_ID = this public key") to remove ambiguity between the private delegate key and the agent id.
```
