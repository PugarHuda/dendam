# 🚀 Deploy Dendam

**Required** for the submission: (1) memory running on **Walrus Mainnet** (via MemWal credentials), and (2) a **public interface** where the memory is visible. The frontend can be hosted anywhere; ideally as a **Walrus Site**.

Architectural constraint: Dendam needs server-side secrets (`MEMWAL_DELEGATE_KEY`, the LLM key), so it **cannot** be a fully static site. Pick one path:

---

## Path 0 — Vercel (ALREADY DEPLOYED) ✅

Live: **https://dendam.vercel.app** · Connected repo: **github.com/PugarHuda/dendam** (push to `main` = auto-deploy).

Production env vars already set: `OPENROUTER_API_KEY`, `DENDAM_LLM_PROVIDER=openrouter`, `DENDAM_MODEL=openai/gpt-oss-120b:free`.

To make memory **persistent on Walrus Mainnet** (required for the submission):
```bash
printf '%s' "<delegate-key-hex>"        | vercel env add MEMWAL_DELEGATE_KEY production
printf '%s' "<memwal-account-id>"        | vercel env add MEMWAL_ACCOUNT_ID production
printf '%s' "https://memory.walrus.xyz"  | vercel env add MEMWAL_SERVER_URL production
vercel deploy --prod --yes               # redeploy so the env is applied
```
Vercel notes: the filesystem is read-only except `/tmp` (ephemeral). The scoreboard (`/api/results`) in `/tmp` can be lost on a cold start — re-feed it after deploy, or use a persistent backend. User memory is unaffected once `MEMWAL_*` is set (it's stored on Walrus). The `maxDuration=60s` function limit is enough for the LLM.

---

## Path A — Full-stack on a Node host (alternative)

Deploy the whole Next.js app (UI + API) to a Node host (Railway, Render, Fly.io, a VPS, etc.). Memory still lives on Walrus.

**With Docker (a `Dockerfile` is provided):**
```bash
docker build -t dendam .
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-... \
  -e DENDAM_MODEL=openai/gpt-oss-120b:free \
  -e MEMWAL_DELEGATE_KEY=... \
  -e MEMWAL_ACCOUNT_ID=... \
  -e MEMWAL_SERVER_URL=https://memory.walrus.xyz \
  dendam
```

**Without Docker (plain Node host):**
```bash
npm ci
npm run build
npm run start        # next start, port 3000
```
Set all env vars in the host dashboard. Attach a public domain → that's your "link to your deployed agent".

> ⚠️ Scoreboard persistence: `data/results.json` is written to disk. On ephemeral hosts (Railway/Render free) the file can be lost on restart. For production, feed results via `POST /api/results` after deploy, or move results to persistent storage. User memory is NOT affected — it's on Walrus.

---

## Path B — Static UI on a Walrus Site + separate API backend

Publish the UI as a **Walrus Site** (very on-brand for Sessions), with the API on a backend host (Path A without the UI). The UI calls the backend via an absolute URL.

1. **Deploy the backend** (Path A) → get `https://api-dendam.example.com`.
2. **Point the frontend at the backend**: change relative fetches (`/api/...`) to `${NEXT_PUBLIC_API_BASE}/api/...`, then static-export. (Requires a small tweak; see the note below.)
3. **Install site-builder & deploy:**
   ```bash
   curl -sSfL https://raw.githubusercontent.com/Mystenlabs/suiup/main/install.sh | sh
   suiup install site-builder@mainnet
   site-builder --config sites-config.yaml deploy ./out
   ```
4. Access via the mainnet portal `https://wal.app` (or a self-hosted portal). That's your public interface on Walrus.

> Note: a Next.js App Router with API routes can't `output: export` directly. The easiest option for Path B: make a read-only client-side page (chat + The File) that calls `NEXT_PUBLIC_API_BASE`. Path A already satisfies every submission requirement without this — do B only if you want the extra "deploy-on-Walrus" flair.

---

## Pre-deploy checklist
- [ ] Host `.env`/secrets: LLM key + `MEMWAL_*` (Mainnet)
- [ ] `npm run check:memory` on the host shows the **memwal** backend & a successful round-trip
- [ ] Dedicated **SUI wallet for Sessions** created; some **WAL** on hand for Walrus storage costs
- [ ] Record: live agent link, **MemWalAccount** explorer link, **MEMWAL_AGENT_ID** (public key)
- [ ] Seed/feed match results (`/api/results` or `npm run seed:results`)
- [ ] Production smoke test: send 1 prediction → check it's stored in The File → Hold me to it
