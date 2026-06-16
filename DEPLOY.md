# 🚀 Deploy Dendam

Yang **wajib** untuk submission: (1) memori berjalan di **Walrus Mainnet** (lewat kredensial MemWal), dan (2) ada **interface publik** tempat memori terlihat. Frontend boleh di-host di mana saja; idealnya sebagai **Walrus Site**.

Kendala arsitektur: Dendam butuh secret server-side (`MEMWAL_DELEGATE_KEY`, kunci LLM), jadi **tidak bisa** seluruhnya jadi static site. Pilih satu jalur:

---

## Jalur A — Full-stack di Node host (paling cepat & aman) ✅ rekomendasi

Deploy seluruh app Next.js (UI + API) ke host Node (Railway, Render, Fly.io, VPS, dll). Memori tetap di Walrus.

**Dengan Docker (sudah disediakan `Dockerfile`):**
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

**Tanpa Docker (host Node biasa):**
```bash
npm ci
npm run build
npm run start        # next start, port 3000
```
Set semua env var di dashboard host. Pasang domain publik → itulah "link to your deployed agent".

> ⚠️ Persistensi data papan skor: `data/results.json` ditulis ke disk. Di host ephemeral (Railway/Render free), file bisa hilang saat restart. Untuk produksi, feed hasil lewat `POST /api/results` setelah deploy, atau pindahkan results ke storage persisten. Memori user TIDAK terpengaruh — itu di Walrus.

---

## Jalur B — UI statis di Walrus Site + backend API terpisah

Tampilkan UI sebagai **Walrus Site** (sangat on-brand untuk Sessions), dengan API di backend host (Jalur A tanpa UI). UI memanggil backend lewat URL absolut.

1. **Deploy backend** (Jalur A) → dapatkan `https://api-dendam.example.com`.
2. **Arahkan frontend ke backend**: ganti fetch relatif (`/api/...`) menjadi `${NEXT_PUBLIC_API_BASE}/api/...` lalu export statis. (Perlu sedikit penyesuaian; lihat catatan di bawah.)
3. **Install site-builder & deploy:**
   ```bash
   curl -sSfL https://raw.githubusercontent.com/Mystenlabs/suiup/main/install.sh | sh
   suiup install site-builder@mainnet
   site-builder --config sites-config.yaml deploy ./out
   ```
4. Akses lewat portal mainnet `https://wal.app` (atau portal self-host). Itulah interface publik di Walrus.

> Catatan: Next.js App Router dengan API routes tidak bisa `output: export` langsung. Untuk Jalur B, opsi termudah: buat halaman read-only (chat + Buku Dendam) yang murni client-side dan memanggil `NEXT_PUBLIC_API_BASE`. Jalur A sudah memenuhi semua syarat submission tanpa langkah ini — kerjakan B hanya jika ingin nilai "flair" deploy-on-Walrus.

---

## Checklist pra-deploy
- [ ] `.env`/secret di host: kunci LLM + `MEMWAL_*` (Mainnet)
- [ ] `npm run check:memory` di host menunjukkan backend **memwal** & round-trip OK
- [ ] Wallet **SUI khusus Sessions** dibuat; ada **WAL** untuk biaya storage Walrus
- [ ] Catat: link agent live, link explorer **MemWalAccount**, **MEMWAL_AGENT_ID** (public key)
- [ ] Seed/feed hasil pertandingan (`/api/results` atau `npm run seed:results`)
- [ ] Smoke test produksi: kirim 1 prediksi → cek tersimpan di Buku Dendam → Tagih prediksiku
