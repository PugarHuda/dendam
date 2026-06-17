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

4) Stable technical execution: a swappable memory layer (MemoryStore interface) with a beta-safe Walrus Memory adapter (dynamic import + result normalization). Includes unit tests (15 passing), a memory round-trip preflight, and a green production build.

5) A strong, shareable persona (a vengeful rival) — not a generic assistant.

6) "Instigator" mode (Hot Seat): Dendam stirs the pot between group members by pitting their ACTUALLY-stored predictions & insults against each other — cross-user memory driving rivalries, highly shareable. Plus a "Hall of Shame" leaderboard (who's most often wrong), computed purely from memory.

7) Multilingual & typo-tolerant: defaults to English, but automatically mirrors each user's language (Indonesian, Spanish, etc.) and understands typos/slang/emoji. Memories are stored canonically in English so cross-user features (instigator, leaderboard) stay consistent.
```

---

### Feedback (about building on Walrus) *
```
What worked well:
- The recall/remember concept fits agentic use cases perfectly — the "owner + namespace" mental model is intuitive.
- Fast initial setup (curl skill installer, npm/pip SDK), and tying memory to an on-chain object (MemWalAccount) gives a real sense of being verifiable.

Challenges we hit:
- Walrus Memory is still beta, so the exact return type of recall() and the lifecycle of the remember() job aren't fully documented — we had to write a defensive adapter that normalizes several possible response shapes.
- It's unclear whether namespace is set at create() or can be per-call, and the multi-user pattern (one client per namespace vs a parameter) needs an official example.
- We found no "list/enumerate" API for a namespace; to build a full memory dashboard we had to do multi-query recall + dedupe.

DX suggestions:
- Publish the full TypeScript schema for RecallResult & RememberJob.
- Add an endpoint/method to list memories per namespace with pagination.
- Document read-your-writes consistency after waitForRememberJob.
(GitHub ticket details below.)
```

### Feedback on using Walrus Memory (GitHub tickets) *
> Open the tickets in the MystenLabs/MemWal repo and paste the links. Ready-to-use drafts are in the "DRAFT GITHUB TICKETS" section below.
```
1. [docs] Document the return schema of recall() (memories vs results vs items) — <issue link>
2. [docs] remember()/job_id lifecycle + read-your-writes consistency after waitForRememberJob — <issue link>
3. [docs] Clarify namespace semantics (create vs per-call) + multi-user pattern — <issue link>
4. [feature] list/enumerate API for memories per namespace with pagination (for dashboards) — <issue link>
5. [dx] Explain MEMWAL_AGENT_ID (public key) vs delegate key in the dashboard — <issue link>
6. [bug] account ops throw "SuiClient not found" with @mysten/sui v2.6+ (client moved to /jsonRpc) despite peer >=2.5.0 — <issue link>
```

---

### Technical fields (fill in after deploy)
```
Link to your deployed agent:                            https://dendam.vercel.app
GitHub:                                                 https://github.com/PugarHuda/dendam
Link to the explorer showing your MemWalAccount object: https://suiscan.xyz/mainnet/object/<MEMWAL_ACCOUNT_ID>
Your MEMWAL_AGENT_ID:                                   <delegate public key from the dashboard>
DeepSurge project Link:                                 <DeepSurge URL, mainnet>
Project Link (URL):                                     https://dendam.vercel.app
SUI address:                                            <dedicated SUI wallet for Sessions>
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
> Verify against the real SDK once your credentials are active — if something is already documented, adjust/drop the related ticket before filing.

**Ticket 1 — [docs] Specify the return schema of `recall()`**
> The SDK quickstart shows `const result = await memwal.recall({ query })` but the shape of `result` (e.g. `result.memories[]`, fields `text`/`content`/`id`/`created_at`) isn't documented. We had to write a defensive normalizer that probes several shapes. Please publish the TypeScript type for the recall response.

**Ticket 2 — [docs] `remember()` job lifecycle & read-your-writes consistency**
> `remember()` appears to return a job (`job_id`) and `waitForRememberJob()` blocks until written. Please document: the job object schema, expected latency/timeout, and whether a `recall()` immediately after `waitForRememberJob()` is guaranteed to see the new memory.

**Ticket 3 — [docs] `namespace` semantics & multi-user pattern**
> Is `namespace` only settable in `MemWal.create(...)`, or can it be passed per `remember`/`recall` call? For multi-user apps, what's the recommended pattern — one client instance per namespace, or a per-call namespace? A short example would help a lot.

**Ticket 4 — [feature] List/enumerate memories for a namespace**
> There's no documented way to list all memories in a namespace (only semantic `recall(query)`). Building a memory dashboard requires enumerating everything; we approximate this with multi-query recall + dedupe. Request a `list({ namespace, limit, cursor })` API with pagination.

**Ticket 5 — [dx] Clarify `MEMWAL_AGENT_ID` vs delegate key in the dashboard**
> The submission form says `MEMWAL_AGENT_ID` is the "Public key part" of the delegate key. The dashboard could label this explicitly (e.g. "MEMWAL_AGENT_ID = this public key") to remove ambiguity between the private delegate key and the agent id.

**Ticket 6 — [bug] account ops break with `@mysten/sui` v2.6+ even though peer is `>=2.5.0`**
> `createAccount`/`addDelegateKey` auto-construct a `SuiClient` from `@mysten/sui/client`, but in `@mysten/sui` v2.6+ the JSON-RPC client moved to `@mysten/sui/jsonRpc` as `SuiJsonRpcClient` — so `@mysten/sui/client` no longer exports `SuiClient` and the call throws `"SuiClient not found. For @mysten/sui v2.6.0+, pass suiClient in opts."`. Since `peerDependencies` declares `@mysten/sui >=2.5.0`, a fresh install pulls v2.18 and breaks out of the box. The workaround (build `new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(network) })` and pass `suiClient`) works, but it should either be auto-detected internally or documented in the quickstart. Repro + fix in our setup script: https://github.com/PugarHuda/dendam (scripts/setup-memwal.ts).
```
