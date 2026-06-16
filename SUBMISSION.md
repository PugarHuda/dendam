# 📋 Teks Submission — Airtable (Walrus Sessions S4)

Salin-tempel ke form: https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO
Isi placeholder `<...>` dengan datamu sebelum submit.

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

### Project description (1 baris)
```
Rival sepak bola AI yang menyimpan dendam: ia mengingat prediksi, hot take, dan trash-talk-mu soal Piala Dunia 2026 lintas sesi via Walrus Memory, lalu menagihmu saat prediksimu meleset.
```

---

### Please describe the workflow and functionalities of your project *
```
Dendam adalah rival sepak bola berkepribadian untuk FIFA World Cup 2026 yang memorinya 100% berjalan di Walrus Memory.

Alur setiap interaksi (3 langkah):
1) RECALL — sebelum menjawab, Dendam memanggil recall() ke Walrus untuk menarik memori relevan tentang user (prediksi lama, hinaan, tim jagoan, hot take).
2) RESPOND — memori itu disuntikkan ke prompt persona; Claude membalas in-character sambil merujuk masa lalu user secara spesifik dan mengonfrontasi inkonsistensi.
3) REMEMBER — setelah membalas, sebuah pass ekstraksi terstruktur menyuling percakapan menjadi 0–3 memori durable, lalu remember() menulisnya ke Walrus untuk sesi berikutnya.

Fitur auto-roast: papan skor pertandingan nyata di-feed ke sistem. Tombol "Tagih prediksiku" mencocokkan prediksi tersimpan dengan hasil nyata; prediksi yang meleset ditandai dan vonis roasting disimpan sebagai memori permanen di Walrus.

Interface publik (Buku Dendam) menampilkan seluruh memori, statistik (prediksi meleset, jumlah hinaan), vonis, dan papan skor — sehingga "memori in action" benar-benar terlihat.

Contoh before/after: Hari 1, handle baru → Dendam mengaku tidak tahu apa-apa tentang user. Setelah beberapa hari user melempar prediksi & trash-talk → di sesi baru Dendam langsung menohok pakai prediksi lama dan hinaan user — sesuatu yang mustahil dilakukan di hari pertama.
```

### Which features sets your solution apart from the rest? *
```
1) Memori dipakai sebagai SENJATA, bukan sekadar log. Setiap prediksi yang meleset jadi amunisi roasting; halaman Buku Dendam memvisualkan akurasi dan "hinaan ke Dendam" si user.

2) Loop before/after yang eksplisit & dapat dibuktikan. Ekstraksi memori terstruktur per giliran + recall lintas-sesi membuat agent hari-N terasa jelas berbeda dari hari-1. Ini persis sinyal yang dicari juri.

3) Auto-roast yang dipicu hasil nyata. Saat skor Piala Dunia masuk, Dendam otomatis mencocokkan prediksi user dengan kenyataan dan menyimpan vonis sebagai grudge permanen di Walrus.

4) Eksekusi teknis yang stabil: lapisan memori swappable (interface MemoryStore) dengan adapter Walrus Memory yang beta-safe (impor dinamis + normalisasi hasil). Disertai unit test (15 lulus), preflight round-trip memori, dan build produksi hijau.

5) Persona yang kuat dan mudah dibagikan (rival pedendam berbahasa Indonesia) — bukan asisten generik.

6) Mode "Tukang Kompor" (Ruang Kompor): Dendam memanas-manasi antar anggota grup dengan mengadu prediksi & hinaan yang BENAR-BENAR tersimpan di memori masing-masing — memori lintas-user dipakai untuk memicu rivalitas, sangat shareable.
```

---

### Feedback (about building on Walrus) *
```
Yang berjalan baik:
- Konsep recall/remember sangat pas untuk use-case agentic — model mental "owner + namespace" intuitif.
- Setup awal cepat (skill installer via curl, SDK npm/pip), dan memori terikat ke objek on-chain (MemWalAccount) memberi rasa "verifiable" yang nyata.

Tantangan yang kami temui:
- Walrus Memory masih beta, sehingga bentuk persis return type recall() dan lifecycle job remember() belum sepenuhnya terdokumentasi — kami harus menulis adapter defensif yang menormalisasi beberapa kemungkinan bentuk respons.
- Belum jelas apakah namespace di-set saat create() atau bisa per-call, dan pola multi-user (satu klien per namespace vs parameter) butuh contoh resmi.
- Tidak menemukan API "list/enumerate" untuk satu namespace; untuk membangun dashboard memori penuh kami terpaksa melakukan multi-query recall lalu dedupe.

Saran perbaikan DX:
- Publikasikan skema TypeScript lengkap untuk RecallResult & RememberJob.
- Tambah endpoint/method list memori per namespace dengan paginasi.
- Dokumentasikan konsistensi read-your-writes setelah waitForRememberJob.
(Detail tiket GitHub di bawah.)
```

### Feedback on using Walrus Memory (GitHub tickets) *
> Buat tiket di repo MystenLabs/MemWal lalu tempel link-nya. Draf siap-pakai ada di bagian "DRAF TIKET GITHUB" di bawah.
```
1. [docs] Dokumentasikan skema return recall() (memories vs results vs items) — <link issue>
2. [docs] Lifecycle remember()/job_id + konsistensi read-your-writes setelah waitForRememberJob — <link issue>
3. [docs] Klarifikasi semantik namespace (create vs per-call) + pola multi-user — <link issue>
4. [feature] API list/enumerate memori per namespace dengan paginasi (untuk dashboard) — <link issue>
5. [dx] Penjelasan MEMWAL_AGENT_ID (public key) vs delegate key di dashboard — <link issue>
```

---

### Field teknis (isi setelah deploy)
```
Link to your deployed agent:                            https://dendam.vercel.app
GitHub:                                                 https://github.com/PugarHuda/dendam
Link to the explorer showing your MemWalAccount object: https://suiscan.xyz/mainnet/object/<MEMWAL_ACCOUNT_ID>
Your MEMWAL_AGENT_ID:                                   <public key delegate dari dashboard>
DeepSurge project Link:                                 <URL DeepSurge, mainnet>
Project Link (URL):                                     https://dendam.vercel.app
SUI address:                                            <wallet SUI khusus Sessions>
X tweet link:                                           <link tweet #Walrus>
Demo video:                                             <upload, ikut DEMO.md, ≤3 menit>
```
> CATATAN: agar memori "live on Walrus Mainnet" (bukan /tmp ephemeral Vercel), set `MEMWAL_*` di Vercel lalu redeploy — lihat DEPLOY.md Jalur 0.

---

## DRAF TIKET GITHUB (repo: MystenLabs/MemWal)
> Verifikasi lebih dulu terhadap SDK asli saat kredensialmu aktif — kalau ternyata sudah terdokumentasi, sesuaikan/hapus tiket terkait sebelum mengirim.

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
```
