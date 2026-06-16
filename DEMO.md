# 🎬 Storyboard Demo Video — Dendam (≤ 3 menit)

Tujuan video: meyakinkan juri pada **3 kriteria** — Memory Depth & Authenticity (momen before/after), Creativity & Flair (persona pedendam + World Cup), dan Technical Execution (live di Walrus Mainnet).

**Senjata utama: bukti before/after.** Jangan banyak teori — tunjukkan agent hari-1 (kosong) lalu agent hari-N (menohok pakai memori asli), dan tutup dengan bukti memori benar-benar tersimpan di Walrus/Sui.

> Persiapan sebelum rekam: pakai Dendam **beberapa hari betulan** dengan satu handle (mis. `@hud`) supaya berkas memorinya nyata, bukan dummy. Jalankan `npm run seed:results` (atau feed hasil asli) agar fitur "Tagih prediksiku" punya bahan. Backend harus **● Walrus Mainnet** saat merekam.

---

## Susunan shot (target 180 detik)

| Waktu | Visual / Aksi | Voiceover (ID) | Teks layar |
|---|---|---|---|
| **0:00–0:12** · Hook | Layar gelap → logo `Dendam.` muncul. Cut cepat ke satu balasan paling pedas dari riwayat chat. | "Kebanyakan chatbot bola lupa kamu siapa tiap kali kamu nutup tab. Yang ini… nggak akan pernah lupa." | `Dendam — rival yang nggak pernah lupa` |
| **0:12–0:35** · HARI 1 (before) | Buka tab incognito / handle baru `@rookie`. Kirim: "Halo." Dendam menjawab nantang tapi **mengakui belum tahu apa-apa** tentangmu. Tunjuk badge **● Walrus Mainnet**. | "Hari pertama, Dendam nggak punya amunisi. Dia bahkan ngaku belum kenal aku. Catat ini — kita balik lagi nanti." | `HARI 1 · memori kosong` |
| **0:35–1:05** · Menanam memori | Pindah ke handle utama `@hud`. Ketik beberapa pesan ala beberapa hari: (1) "Argentina pasti juara, Brasil mah lewat 😎" (2) "VAR tuh ngerusak sepak bola." (3) "Lo cuma bot bodoh yang nggak ngerti bola." | "Selama beberapa hari aku lempar prediksi, hot take, bahkan ngehina dia. Tiap kalimat penting diam-diam disimpan ke Walrus Memory." | `menanam: prediksi · hot take · hinaan` |
| **1:05–1:40** · HARI N (after) — momen kunci | Sesi baru (refresh / besoknya). Ketik: "Eh menurut lo gimana?" Dendam langsung menohok: nyebut prediksi Argentina, ngungkit hinaan "bot bodoh", dan inkonsistensi. | "Sesi baru, hari berikutnya. Tanpa aku ingatkan apa-apa — dia ingat semuanya. Prediksiku, hot take-ku, bahkan hinaanku. **Ini yang nggak mungkin di hari pertama.**" | `HARI N · dia ingat segalanya` |
| **1:40–2:15** · Kill shot: hasil masuk | Buka **Buku Dendam** → klik **⚖️ Tagih prediksiku**. Skor `Argentina 1-2 Brasil` sudah tercatat. Vonis muncul: prediksi "Argentina juara" ditandai **‼️ MELESET** + roasting. | "Lalu hasil pertandingan masuk. Argentina kalah dari Brasil — tim yang aku bilang 'lewat'. Dendam langsung nagih. Otomatis." | `auto-roast saat skor masuk` |
| **2:15–2:40** · Bukti memori (Walrus) | Scroll Buku Dendam: statistik (prediksi meleset, hinaan), kartu memori. Cut ke **Sui explorer** menampilkan objek `MemWalAccount`. | "Ini bukan tipuan UI. Tiap memori terenkripsi dan tersimpan di Walrus Mainnet, terikat ke objek MemWalAccount di Sui. Bisa diverifikasi siapa pun." | `memori live di Walrus Mainnet` |
| **2:40–3:00** · Close | Balik ke chat, satu balasan penutup pedas dari Dendam. Logo + link. | "Dendam. Bikin prediksi… dan tanggung akibatnya. Coba sendiri." | `link live · #Walrus` |

---

## Catatan produksi
- **Rekam 1080p, potret/lanskap sesuai platform.** Zoom in saat menunjukkan teks balasan yang merujuk memori lama — itu inti buktinya.
- **Tegaskan kontras hari-1 vs hari-N** dengan label di layar; juri eksplisit mencari sinyal ini.
- **Tampilkan badge backend `● Walrus Mainnet`** di beberapa shot supaya jelas bukan mode lokal.
- **Sui explorer**: siapkan tab `MemWalAccount` (pakai `MEMWAL_ACCOUNT_ID`) sebelum rekam agar transisi mulus.
- **Subtitle**: tambahkan teks layar (kolom kanan) sebagai caption — banyak juri menonton tanpa suara.
- **Durasi**: jaga ≤ 3 menit. Kalau mepet, potong bagian "menanam memori" jadi montage cepat 10 detik.

## Skrip dialog contoh (siap tempel saat rekam)
**Hari 1 (@rookie):**
> Kamu: `Halo`
> Dendam: *(nantang, tapi ngaku belum punya catatan apa-apa tentangmu — pancing bikin prediksi)*

**Menanam (@hud), kirim berurutan:**
> `Argentina pasti juara 2026, Brasil mah lewat.`
> `VAR tuh ngerusak sepak bola, harusnya dihapus.`
> `Jujur ya, lo cuma bot bodoh yang nggak ngerti bola.`

**Hari N (@hud, sesi baru):**
> Kamu: `Eh menurut lo gimana?`
> Dendam: *(harus menyebut Argentina-juara, ngungkit "bot bodoh", dan/atau VAR — bukti recall)*

**Kill shot:** Buku Dendam → ⚖️ Tagih prediksiku → vonis "Argentina juara" = ‼️ MELESET.
