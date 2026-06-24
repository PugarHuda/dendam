# 👀 60-second reviewer walkthrough — Dendam

A fast path to evaluate Dendam against the Session 4 criteria (Memory Depth & Authenticity · Creativity & Flair · Technical Execution). Everything below is **live on Walrus Mainnet**.

## See it in 60 seconds
1. **Open** https://dendam.vercel.app → **Start the beef → Chat as guest** (no wallet needed; badge reads **● Walrus Mainnet**, not local).
2. **See a real file (pre-populated, on-chain):** https://dendam.vercel.app/share/demo (20 memories) and https://dendam.vercel.app/share/budi — the **reigning fraud**: 2 predictions · **2 busted** · 0% accuracy · 1 insult, with a real **WRONG** verdict. Read straight from Walrus Mainnet at request time — refresh and it persists.
3. **Verify it's genuinely on-chain:** click **Verify on Sui explorer ↗** on that page, or go direct:
   https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e
   (type `…::account::MemWalAccount`, a Shared object on Sui).
4. **Prove the before/after yourself (the money shot):** in `/chat`, set the nickname (top bar) to a **new** handle e.g. `judge-7`, say `Hey` → Dendam **admits it has nothing on you** (no fabrication). Now change the nickname to **`demo`** and ask **`what do you remember about me?`** → it recalls the Argentina/Mbappé picks, the VAR take and the insults, with a **📂 pulled N memories** chip you can expand. (Or make your own call, then **The File → Run reconcile** auto-roasts a wrong one **WRONG**.)
5. **Multiplayer / Hall of Shame:** https://dendam.vercel.app/group — enter `budi, hud, sarah, reyhan, ta` → **Tally the board** → ranked purely from stored memory (@budi #1). Or just open https://dendam.vercel.app/share/budi.
6. **Optional — true ownership:** **Start the beef → Connect Sui wallet** → sign a gasless message → your File is namespaced to your verified address (impossible to spoof by guessing a nickname).

## The memory loop (what's actually happening)
`recall()` from Walrus → reply in persona using real memories → extract 0–3 durable grudges → `remember()` back to Walrus. Per-user namespace, structured kinds (prediction / hot_take / insult / favorite / result). Auto-roast judges stored predictions against results and writes a permanent verdict.

## Technical at a glance
- **Backend:** Walrus Memory (MemWal) on **Sui Mainnet**; swappable `MemoryStore` interface (beta-safe adapter).
- **Quality:** 60 unit tests, green typecheck/build (25 routes), a live smoke sweep, and an E2E demo verifier (`node scripts/demo-verify.mjs`).
- **Identity:** guest by default (one-click, no wallet); optional **Sui wallet** sign-in (gasless signature, verified server-side) for a File namespaced to your address.
- **Cold-start safety:** a deterministic guard stops weak models from fabricating a fake "past" on day one.
- **Shared-relayer hardening:** read caching, sequential reads, paced/back-off writes, and "syncing to Walrus" indicators (delegate key is ~30 weighted req/min).
- **Shareable:** per-handle + head-to-head OG cards, `?handle=` deep links, robots/sitemap.

Full detail: [`README.md`](./README.md) · demo script: [`DEMO.md`](./DEMO.md) · feedback filed: [`SUBMISSION.md`](./SUBMISSION.md).
