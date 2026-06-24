# Walrus Session 4 — Submission form, every field filled

Copy each block into the matching field. Only **4 items are yours to paste**
(marked ⚠️): DeepSurge link, your X tweet link, your X handle (optional), and the
referral answer.

---

**Project name**
> Dendam

**Please select the session**
> Session 4: Walrus Memory World Cup

**Team Leader Name**
> Pugar Huda Mantoro

**Team Leader Email**
> hudapugar@gmail.com

**Open to receiving the newsletter** — your choice (check it if you want their newsletter).

**Team Leader Telegram Handle**
> lynx129

**Discord handle**
> hajislamet

**Country**
> Indonesia

**⚠️ DeepSurge project Link (must be on mainnet)**
> Paste your DeepSurge project page URL here.

**Project Link (URL)**
> https://dendam.vercel.app

**I confirm that I have submitted it on Mainnet**
> Yes ✅

---

**Please describe the workflow and functionalities of your project**
> Dendam is a grudge-holding AI football rival for the FIFA World Cup 2026, and its memory runs entirely on Walrus Memory (Sui Mainnet). Every time you talk to it, it runs the same three-step loop:
>
> 1. Recall — before it replies, Dendam runs a semantic recall against Walrus Memory to pull everything relevant it already knows about you: your past predictions, your hot takes, your favourite and hated teams, and the insults you have thrown at it.
> 2. Respond — those recalled memories are injected into its persona prompt and it replies in character as a vengeful rival: it quotes your past self back at you word for word, in your own language (it mirrors Indonesian, Spanish, English and more, and tolerates typos, slang and emoji), and it calls out your contradictions.
> 3. Remember — after replying, a structured extraction pass distils the exchange into zero to three durable memories (a prediction, a hot take, an insult, a favourite team) and writes them to Walrus Memory so the next session is sharper.
>
> The before/after is built in and provable. On day one, with a brand-new handle, Dendam has nothing on you and openly admits it — a deterministic anti-fabrication guard means it literally cannot invent a fake past. After a few sessions it has a thick file on you and weaponises it.
>
> Auto-roast: real World Cup 2026 match results are stored on Walrus as well. The "Run reconcile / Hold me to it" action matches your stored predictions against the real results and stamps the wrong ones WRONG — permanently, as a new on-chain memory.
>
> The memory is visible and verifiable everywhere, not hidden in a log:
> - The File (the public dossier at /dossier and /share/<name>): your full memory — every prediction, hot take, insult and verdict — plus accuracy stats, a "Grudge of the day", and an "Ask the file" box that runs live semantic recall on demand. Every memory card links to its real Walrus blob so anyone can verify it on-chain.
> - Hall of Shame: a leaderboard that ranks a group of users purely from their stored memory — who has been most confidently wrong.
> - Match Rooms: a chat room per match where people drop their call (stored on Walrus, so it also lands in their File), Dendam automatically jumps in and stirs the pot using what each person actually said, and when the result lands the correct callers split a clearly-labelled mock prize pool. The room chat is genuinely cross-user: everyone in the room sees the same thread on Walrus, including Dendam's reactions.
> - Shareable roast cards for any handle, plus head-to-head "who is the bigger fraud" cards.
>
> Identity is wallet-optional. You can start chatting instantly as a guest with just a nickname (frictionless for first-timers and judges), or connect a Sui wallet and sign a gasless message to truly own your File — the memory namespace becomes your verified wallet address, so nobody can read it or impersonate you by guessing a nickname. A "Start the beef" choice modal lets you pick and explains the trade-off.

**Which features set your solution apart from the rest?**
> 1. The memory changes the agent, it is not just a log. Every wrong prediction becomes roasting ammunition, and The File visualises your accuracy and how many times you have insulted Dendam. The day-1 versus day-N contrast is built in and demonstrable — that is exactly the signal the judging criteria reward.
> 2. A hard anti-fabrication guard. On a cold start Dendam is forbidden from claiming you ever said anything; it admits it has nothing on you. So when it later quotes you verbatim, you know the memory is real, not the model bluffing.
> 3. Result-triggered auto-roast. When real World Cup scores land, Dendam automatically matches them to your stored predictions and writes a permanent WRONG verdict back to Walrus.
> 4. The memory is visible and verifiable, not a black box. Each reply shows a "pulled N memories from your file" chip you can expand to see the exact memories that grounded it, every memory card links to its real Walrus blob, and "Ask the file" runs live semantic recall on demand — proving vector search on Walrus, not a keyword log.
> 5. A strong, shareable persona: a vengeful rival, not a generic helpful assistant — which fits the high-stakes, trash-talk energy of a World Cup.
> 6. Genuinely multiplayer memory. Hall of Shame and Match Rooms are computed cross-user from stored memory; Dendam pits people against each other using their own words, and rooms are a shared on-chain thread that Dendam joins.
> 7. Multilingual and typo-tolerant. It defaults to English but mirrors each user's language and shrugs off slang, typos and emoji; memories are stored canonically so cross-user features stay consistent.
> 8. Wallet-optional identity done right. Guests play in one click; connecting a Sui wallet upgrades to true on-chain ownership (the File is namespaced to the verified address, signature-gated, impossible to spoof).
> 9. Real, pre-seeded on-chain data. The @demo file and the Hall-of-Shame handles (@budi the reigning fraud, plus @hud, @sarah, @reyhan, @ta) are real memories on Mainnet, so judges hit the day-N experience instantly with zero waiting.
> 10. Production hardening for a shared relayer: short-TTL read caching, sequential reads, paced and backing-off writes, request time-boxing, and "syncing to Walrus" indicators — with 60 passing unit tests and a green build.

**Feedback on using Walrus Memory (GitHub tickets)**
> Filed / contributed on github.com/MystenLabs/MemWal:
> 1. [bug] createAccount/addDelegateKey throw "SuiClient not found" on @mysten/sui v2.6+ despite peer >=2.5.0 — https://github.com/MystenLabs/MemWal/issues/300
> 2. [feature] A query-less list/enumerate primitive for a namespace (needed for a complete memory dashboard / leaderboard) — contributed to https://github.com/MystenLabs/MemWal/issues/271
> 3. [docs] Read-your-writes consistency guarantee after waitForRememberJob — contributed to https://github.com/MystenLabs/MemWal/issues/272
> Additional findings from this build, ready to file (text in the repo's SUBMISSION.md):
> 4. [feedback] The delegate-key rate limit (~30 weighted requests/min) is the whole app's shared budget, so multi-user fan-out reads and write bursts hit 429s and rate-limited reads come back empty; please raise/expose the limit, document per-call weight, and surface retry_after as a typed error.
> 5. [docs] Document write→read propagation time on Mainnet (~15–40s) — a remember() succeeds but is not readable for a while.

**Feedback (about building on Walrus)**
> What worked well: the recall/remember/list model fits agentic use cases perfectly — the "owner + namespace" mental model is intuitive, and tying each memory to an on-chain MemWalAccount object makes the whole thing genuinely verifiable, which is a great story for users. The SDK matured quickly during the hackathon (by v0.0.7 the recall/remember types and the remember-job state machine are fully described), and a per-user "file" maps cleanly onto a namespace, which made the multi-user features (Hall of Shame, head-to-head, Rooms) straightforward.
>
> Challenges: (1) The delegate-key rate limit of ~30 weighted requests per minute is shared across the entire app, so anything that fans out reads (a group leaderboard over N handles, a few pages loading at once, room polling) or writes in a burst (seeding, a busy room) trips a 429 — and a rate-limited list() returns empty, which silently renders a page blank rather than erroring. We worked around it with a short-TTL read cache, sequential leaderboard reads, a paced and backing-off writer, and optimistic "syncing to Walrus" UI. (2) Write→read propagation on Mainnet is ~15–40 seconds: a remember() returns success but the memory is not readable by other clients for a while, which is undocumented and needed UX accommodation. (3) There is still no list/enumerate primitive that returns a namespace's decrypted memories with pagination, so a full "memory dashboard" has to be approximated with multi-query recall plus dedupe. (4) On a fresh install, peer "@mysten/sui >=2.5.0" pulls v2.18, where account ops throw "SuiClient not found" unless you pass suiClient yourself; the docstring still says the SDK creates one internally.
>
> Wishlist: a higher or configurable delegate-key limit (and a typed 429 error carrying retry_after); a documented read-your-writes consistency option or a stated propagation window; a paginated list({ namespace, limit, cursor }) returning decrypted memories; and either auto-detecting the v2.6+ Sui client or updating the quickstart to say suiClient is required.

---

**X account** — ⚠️ your X handle (optional; lets them tag you in the announcement).

**⚠️ Share link to X tweet** — paste the link to your #Walrus demo tweet (suggested text below).

**SUI address**
> 0xed1e706c3fc3b11337a966a598785fa2da4190368b9a9789d4d99fca9c46d65e

**GitHub**
> https://github.com/PugarHuda/dendam

**⚠️ Did you get referred to Session 4 by someone?**
> No. (Or paste the referrer's Discord handle if someone referred you.)

**Session Feedback**
> The World Cup theme plus a persistent-memory requirement was a great pairing — the explicit before/after criterion pushed us to build genuine cross-session memory instead of a thin wrapper, which made the project much stronger. Suggestion: surface the relayer rate limits and write→read propagation expectations early in onboarding, since they shape how you architect a multi-user app on Walrus Memory.

**Would you help test the new data visualization/management product?**
> Yes (your choice — set to No if you prefer).

**DeepSurge Feedback**
> Smooth submission flow overall. A short checklist of exactly which links the
> judges need (live URL, MemWalAccount explorer, MEMWAL_AGENT_ID) right on the
> project page would make it faster to prepare a complete submission.

**Link to your deployed agent (live on Walrus Mainnet)**
> https://dendam.vercel.app/chat

**Link to the explorer showing your MemWalAccount object**
> https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e

**Your MEMWAL_AGENT_ID**
> 37891bc6e27b72ff2a133dbe833de6ceb5d4f7ee215caeaf369e4eee84ddf57d

**I confirm that I have read, understood, and agree to the rules**
> Yes ✅

---

## Visuals to upload (in the repo's `.design/` folder)
`landing-v2.png` · `beef-modal.png` · `guest-chat.png` · `dossier-v2.png` · `share-v2.png` · `group-v2.png` · `roomdetail-v2.png`

## Your #Walrus tweet (paste, then put the link in "Share link to X tweet")
> Meet Dendam 🔥⚽ — a World Cup 2026 rival AI that NEVER forgets.
>
> Every prediction & hot take you make is stored on @WalrusProtocol Memory, then thrown back when you're wrong.
>
> Day 1 it knows nothing. Day 5 it has a FILE on you.
>
> #Walrus
> https://dendam.vercel.app
