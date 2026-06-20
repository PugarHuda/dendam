# 👀 60-second reviewer walkthrough — Dendam

A fast path to evaluate Dendam against the Session 4 criteria (Memory Depth & Authenticity · Creativity & Flair · Technical Execution). Everything below is **live on Walrus Mainnet**.

## See it in 60 seconds
1. **Open** https://dendam.vercel.app — the badge reads **● Walrus Mainnet** (not local).
2. **See a real file (pre-populated, on-chain):** https://dendam.vercel.app/share/demo-mql7bgwq
   - 8 memories · 2 predictions · **2 wrong calls** · 2 insults, with a real roast quote.
   - This is read straight from Walrus Mainnet at request time — refresh and it persists.
3. **Verify it's genuinely on-chain:** click **MemWalAccount object on Sui ↗** on that page, or go direct:
   https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e
   (type `…::account::MemWalAccount`, a Shared object on Sui).
4. **Prove the before/after yourself:** open https://dendam.vercel.app/chat, type a **new** handle in the top bar (e.g. `judge-7`), say `Hey` → Dendam **admits it has nothing on you** (no fabrication). Make a bold call (`Argentina wins it all, Brazil's done`). Come back to **The File** (`/dossier`) → click **⚖️ Hold me to it** → the call is auto-roasted **WRONG**.
5. **Group flair:** https://dendam.vercel.app/grup — enter two handles (try `demo-mql7bgwq, judge-7`) → **🔥 Stir it up** / **🏆 Hall of Shame** → then **🆚 Share the head-to-head** for a rivalry card.

## The memory loop (what's actually happening)
`recall()` from Walrus → reply in persona using real memories → extract 0–3 durable grudges → `remember()` back to Walrus. Per-user namespace, structured kinds (prediction / hot_take / insult / favorite / result). Auto-roast judges stored predictions against results and writes a permanent verdict.

## Technical at a glance
- **Backend:** Walrus Memory (MemWal) on **Sui Mainnet**; swappable `MemoryStore` interface (beta-safe adapter).
- **Quality:** 49 unit tests, green typecheck/build, a live smoke sweep (`node scripts/smoke.mjs`, 17/17), and an E2E demo verifier (`node scripts/demo-verify.mjs`).
- **Cold-start safety:** a deterministic guard stops weak models from fabricating a fake "past" on day one.
- **Shareable:** per-handle + head-to-head OG cards, `?handle=` deep links, robots/sitemap.

Full detail: [`README.md`](./README.md) · demo script: [`DEMO.md`](./DEMO.md) · feedback filed: [`SUBMISSION.md`](./SUBMISSION.md).
