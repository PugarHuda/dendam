# ✅ Submission checklist — Dendam (Walrus Sessions S4)

**Deadline: 24 Jun 2026 · Results: 2 Jul 2026.** Form: https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO
Paste-ready field text lives in [`SUBMISSION.md`](./SUBMISSION.md). Demo script in [`DEMO.md`](./DEMO.md).

---

## Done (code / infra — verified)
- [x] **App live on Walrus Mainnet** — https://dendam.vercel.app (`backend=memwal · network=mainnet`)
- [x] **MemWalAccount on-chain** — `0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e` ([explorer](https://suiscan.xyz/mainnet/object/0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e))
- [x] **MEMWAL_AGENT_ID** — `37891bc6e27b72ff2a133dbe833de6ceb5d4f7ee215caeaf369e4eee84ddf57d`
- [x] **SUI address** — `0xed1e706c3fc3b11337a966a598785fa2da4190368b9a9789d4d99fca9c46d65e`
- [x] **Public repo** — https://github.com/PugarHuda/dendam
- [x] **Before/after proven live** — cold-start admits no memory; new session recalls planted prediction/hot-take/insult
- [x] **Auto-roast kill-shot works out of the box** — bundled seed result → "Run reconcile" returns a WRONG verdict
- [x] **Memory visible** — The File (`/dossier`) + public `/share/<handle>` pages (no wallet needed to view)
- [x] **Identity wallet-optional** — guest mode by default (frictionless); Sui wallet sign-in for true ownership
- [x] **Real on-chain seed data** — `npm run seed:demo`: @demo + Hall-of-Shame handles (@budi the fraud) populated on Mainnet
- [x] **Shareable** — per-handle + head-to-head OG/Twitter cards, Copy link + Post to X, `?handle=` deep-links
- [x] **Quality** — **60/60 unit tests**, green build (25 routes), live smoke sweep + E2E (auth, cross-user rooms, isolation)
- [x] **Demo video** — auto-recorded via `npm run media:record` (`.design/dendam-demo.mp4`, ~85s, captioned)
- [x] **Feedback filed** — issue [#300](https://github.com/MystenLabs/MemWal/issues/300) + comments on [#271](https://github.com/MystenLabs/MemWal/issues/271#issuecomment-4738923047) / [#272](https://github.com/MystenLabs/MemWal/issues/272#issuecomment-4738923217); two more drafted (rate limit, propagation) in `SUBMISSION.md`

## Your actions (cannot be automated)
- [ ] **Upload the demo video** — `.design/dendam-demo.mp4` (or record a voiced one from [`DEMO.md`](./DEMO.md))
- [ ] **Post the #Walrus tweet** — text in [`FORM-ANSWERS.md`](./FORM-ANSWERS.md); the OG card auto-attaches → paste the link in the form
- [ ] **Get the DeepSurge project link** (mainnet) → paste into the form
- [ ] **Submit the Airtable form** — every field is filled verbatim in [`FORM-ANSWERS.md`](./FORM-ANSWERS.md)
- [ ] **Join the Walrus Discord** (required) — handle `hajislamet`
- [ ] (optional) Set `DENDAM_REQUIRE_WALLET=1` on Vercel if you want wallet mandatory instead of guest-default
- [ ] 🔒 **Rotate the leaked OpenRouter key** (openrouter.ai) and update the Vercel env
- [ ] 🔒 **Move SUI funds** out of the wallet whose key was exposed in chat (the MemWalAccount stays valid — the app only uses the delegate key)

## Optional, before recording
- [ ] Sharper roasts: set `DENDAM_MODEL=claude-sonnet-4-6` + `ANTHROPIC_API_KEY` on Vercel (free model is already fine)
- [ ] Pre-open the explorer tab and a `/share/<handle>` page for smooth cuts

---
_Re-verify anytime: `node scripts/smoke.mjs` (live health) · `node scripts/demo-verify.mjs` (fresh Day-1 → plant → Day-N → kill-shot)._
