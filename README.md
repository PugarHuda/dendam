# Dendam ⚽🔥

> Rival sepak bola berbasis AI yang **menyimpan dendam**. Setiap prediksi, hinaan, dan hot take-mu soal **FIFA World Cup 2026** disimpan di **Walrus Memory**, lalu ditagih kembali saat kamu meleset.

Dibuat untuk **Walrus Sessions — Session 4: Walrus Memory World Cup**.

Inti idenya sesuai brief panitia: agent dengan **memori persisten sungguhan** yang menunjukkan **momen before/after** — di hari pertama Dendam tidak tahu apa-apa; setelah beberapa hari ia punya berkas tebal tentangmu dan memakainya untuk menohok.

## 🔗 Live
- **App:** https://dendam.vercel.app
- **Repo:** https://github.com/PugarHuda/dendam

> ⚠️ Agar memori benar-benar **persisten di Walrus Mainnet** (dan demo before/after sah), set env `MEMWAL_*` di Vercel lalu redeploy. Tanpa itu, app pakai memori file sementara di `/tmp` serverless yang **tidak persisten** antar-request (ephemeral, per-instance). Untuk demo dengan model yang patuh (tanpa mengarang memori di hari-1), gunakan model yang lebih kuat (`DENDAM_MODEL=claude-sonnet-4-6` via Anthropic, atau model OpenRouter berkualitas).

---

## Cara kerja (alur memori)

Setiap giliran chat menjalankan loop 3 langkah:

1. **RECALL** — `store.recall(namespace, pesanUser)` menarik memori relevan dari Walrus (semantic search).
2. **RESPOND** — memori disuntikkan ke system prompt persona; Claude menjawab in-character sambil merujuk masa lalumu secara spesifik.
3. **REMEMBER** — pass ekstraksi (`generateObject`) menyuling percakapan jadi 0–3 memori durable (prediksi / hinaan / favorit / hot take), lalu `store.remember(...)` menulisnya ke Walrus untuk sesi berikutnya.

```
User ─▶ /api/chat
          │ 1. recall(namespace, query) ──▶ Walrus Memory (recall)
          │ 2. streamText(system = persona + memori) ──▶ Claude
          │ 3. onFinish: extractGrudges() ──▶ remember() ──▶ Walrus Memory (store)
          ▼
     stream jawaban  +  /dossier menampilkan memori (publik)
```

**Memori tersimpan** terlihat publik di halaman **Buku Dendam** (`/dossier`) — memenuhi syarat "interface tempat memori terlihat".

### 🔥 Ruang Kompor (tukang kompor grup)
Halaman `/grup`: masukkan beberapa handle anggota grup. Endpoint `POST /api/kompor`
membaca memori **nyata** tiap anggota (prediksi, hinaan, tim favorit) dan
membuat Dendam **mengadu mereka** — mengutip take satu orang ke rivalnya, lalu
men-tag `@handle`. Memori lintas-user dipakai untuk memicu rivalitas, bukan
sekadar 1-on-1. Kompor yang dibuat juga disimpan ke memori tiap anggota.

### Auto-roast saat hasil pertandingan masuk
Papan skor nyata di-feed lewat `POST /api/results` (token-gated) atau `npm run seed:results`. Di Buku Dendam, tombol **⚖️ Tagih prediksiku** memanggil `/api/reconcile`: Dendam mencocokkan prediksi tersimpan dengan hasil nyata, menandai yang **meleset** (`wasWrong`), dan menyimpan **vonis** sebagai grudge permanen di Walrus. Inilah "kill shot" demo — prediksi "Argentina juara" otomatis di-roast begitu Argentina kalah.

---

## Arsitektur

```
app/
  api/chat/route.ts        recall → Claude (stream) → extract → remember
  api/memories/route.ts    pembacaan publik untuk dossier
  api/results/route.ts     feed papan skor (GET list / POST upsert, token)
  api/reconcile/route.ts   cocokkan prediksi vs hasil → vonis + grudge
  api/kompor/route.ts      tukang kompor: adu domba antar anggota grup
  page.tsx                 layar "Lawan" (chat)
  dossier/page.tsx         "Buku Dendam" — memori, vonis, papan skor
  grup/page.tsx            "Ruang Kompor" — manas-manasin grup
lib/
  memory/
    types.ts               MemoryStore interface + (de)serialisasi metadata
    memwal.ts              adapter Walrus Memory (PRODUKSI / Mainnet)
    local.ts               fallback file lokal (dev saja)
    index.ts               factory + namespace per-user
  persona.ts               karakter "Dendam" + render blok memori
  grudge.ts                ekstraksi memori terstruktur (zod + generateObject)
  verdict.ts               vonis prediksi vs hasil (auto-roast)
  kompor.ts                logika tukang kompor (adu memori antar user)
  results.ts               store hasil pertandingan (papan skor)
  anthropic.ts             konfigurasi model Claude
scripts/
  setup-check.ts           preflight round-trip memori (npm run check:memory)
  seed-results.ts          seed hasil contoh (npm run seed:results)
DEMO.md                    storyboard demo video 3 menit
```

**Lapisan memori dapat ditukar.** Semua kode bicara ke interface `MemoryStore`. Ada dua implementasi:

| Backend | Kapan dipakai | Catatan |
|---|---|---|
| `memwal` | Submission / produksi | Menyimpan ke **Walrus Mainnet** via `@mysten-incubation/memwal`. Aktif otomatis bila kredensial diisi. |
| `local` | Dev / demo cepat | File `data/memories.json`, recall berbasis keyword. **Bukan** backend valid untuk submission. |

> Adapter MemWal sengaja defensif (impor dinamis, normalisasi hasil) karena SDK masih beta. Jika API SDK asli berbeda, **`lib/memory/memwal.ts` adalah satu-satunya file yang perlu disesuaikan.**

---

## Menjalankan

### 1. Dev cepat (tanpa Walrus, pakai fallback lokal)
```bash
npm install
cp .env.example .env.local      # isi kunci LLM (lihat di bawah)
npm run dev                     # http://localhost:3000
```
Badge akan menampilkan **● Local (dev)**.

**Pilih "otak" LLM (salah satu):**
- **Anthropic langsung** — isi `ANTHROPIC_API_KEY` (default `DENDAM_MODEL=claude-sonnet-4-6`).
- **OpenRouter** — isi `OPENROUTER_API_KEY` (otomatis dipakai). Bisa pakai **model gratis**, mis. `DENDAM_MODEL=openai/gpt-oss-120b:free` (sudah diuji end-to-end: chat, ekstraksi memori, dan auto-roast semua jalan). Slug lain ada di openrouter.ai/models. OpenRouter dipakai lewat endpoint OpenAI-compatible.

> Karena banyak model gratis tidak mendukung native structured output, `lib/structured.ts` punya **fallback**: jika `generateObject` gagal, ia minta model membalas JSON mentah lalu mem-parse + memvalidasinya dengan zod. Jadi ekstraksi memori & vonis tetap jalan di model free.

> ⚠️ Kunci LLM ≠ kredensial Walrus Memory. OpenRouter hanya mengganti LLM-nya; memori **tetap** butuh kredensial MemWal (lihat langkah 2) agar submission valid. Pilih model yang mendukung structured output (Claude / GPT-4o-class) karena Dendam memakai `generateObject`.

### 2. Mode submission (Walrus Mainnet)
1. Buat akun di **https://memory.walrus.xyz/dashboard**.
2. Di bagian **delegate keys**, buat delegate key. **`MEMWAL_AGENT_ID` = bagian Public key** (ini yang ditempel ke form submission).
3. Isi `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   DENDAM_MODEL=claude-opus-4-8        # atau claude-sonnet-4-6
   MEMWAL_DELEGATE_KEY=<hex private delegate key>
   MEMWAL_ACCOUNT_ID=<MemWalAccount id>
   MEMWAL_SERVER_URL=https://memory.walrus.xyz
   MEMWAL_AGENT_ID=<public key delegate>
   ```
4. Verifikasi round-trip ke Walrus:
   ```bash
   npm run check:memory          # remember → recall, harus ✅
   ```
   Badge di UI akan menampilkan **● Walrus Mainnet**.

---

## Deploy

- **Frontend** bisa di-deploy sebagai **Walrus Site** (static) atau host Node biasa.
  - Karena `/api/*` butuh secret (delegate key, Claude key), jalankan rute API di backend (host Node / serverless). UI statis ke Walrus Sites:
    ```bash
    curl -sSfL https://raw.githubusercontent.com/Mystenlabs/suiup/main/install.sh | sh
    suiup install site-builder@mainnet
    site-builder deploy ./out      # hasil `next build` + export, dengan API di backend terpisah
    ```
  - Atau deploy full-stack Next.js ke host Node mana pun; yang **wajib** adalah memori berada di **Walrus Mainnet**.
- Buat **wallet SUI khusus** untuk Sessions dan siapkan **WAL** untuk biaya storage.

---

## Pemetaan ke syarat submission

| Syarat | Di proyek ini |
|---|---|
| Integrasi Walrus Memory untuk track interaksi WC 2026 | `lib/memory/memwal.ts` + loop recall/remember di `api/chat` |
| Memori persisten sungguhan (before/after) | Ekstraksi grudge per giliran; Dendam merujuk prediksi/hinaan sesi lalu |
| State & memori di Walrus, Mainnet | Backend `memwal` → Walrus Mainnet |
| Interface publik yang menampilkan memori | `/dossier` Buku Dendam + statistik |
| MemWalAccount di explorer | `MEMWAL_ACCOUNT_ID` (cek di Sui explorer) |
| MEMWAL_AGENT_ID | public key delegate (`MEMWAL_AGENT_ID`) |
| Demo video ≤3 menit | tunjukkan hari-1 vs hari-N + Buku Dendam |

## Yang membuat Dendam beda
- **Memori = senjata, bukan log.** Setiap prediksi yang meleset jadi amunisi roasting; halaman Buku Dendam memvisualkan akurasimu dan "hinaan ke Dendam".
- **Persona kuat** (rival pedendam Indonesia) — bukan asisten generik.
- **Lapisan memori swappable + adapter beta-safe** → eksekusi teknis stabil.

---

## Testing & QA
```bash
npm test            # 15 unit test (serialize/parse, LocalMemoryStore, normalize MemWal, results)
npm run typecheck   # tsc --noEmit
npm run build       # build produksi Next.js
npm run check:memory  # round-trip remember → recall (backend aktif)
```
Status terverifikasi: typecheck OK · 15/15 test lulus · build hijau (4 API route) · endpoint publik diuji (results/memories 200, validasi 400, reconcile & chat graceful tanpa hang).

## Dokumen pendukung
- [`DEMO.md`](./DEMO.md) — storyboard demo video 3 menit (shot list + skrip dialog).
- [`SUBMISSION.md`](./SUBMISSION.md) — teks form Airtable siap-tempel + draf 5 tiket feedback GitHub.

## Lisensi
Apache-2.0
