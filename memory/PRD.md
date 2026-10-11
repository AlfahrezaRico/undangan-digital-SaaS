# PRD — Undangan Digital Bali: Lira & Febi

## Problem Statement (asli)
Undangan digital tema Bali untuk dibagikan via WhatsApp. Pernikahan Lira Nuraulia Asdwiningtyas, S.Psi. (putri Bpk. Hadi Wiyono & Ibu Ni Wayan Rindiasih) & Febi Herlis Setiawan, S.Ak. (putra Bpk. Heriyanto & Ibu Liestari), 01 November 2026, Balai Sarmili, Depok. Akad 10.00 WIB–selesai, Resepsi 13.00–16.30 WIB. Maps: https://maps.app.goo.gl/yNbbxjNhwcBPoaVZ7?g_st=ic

## Iterasi 2 (09 Okt 2026)
- Upload file audio langsung (MP3/dll), auto-play saat "Buka Undangan"
- Ringkasan RSVP (jumlah hadir/berhalangan)
- Tombol "Simpan ke Kalender" (Google Calendar + unduh .ics)
- Bagian Love Story (TEKS MASIH CONTOH — menunggu cerita asli dari pengguna)
- Tombol "Kirim Hadiah" dengan rekening bank PLACEHOLDER (menunggu nomor asli)
- Efek 3D (tilt card, parallax hero) + desain motion premium (framer-motion, lenis, marquee)
- "Share the joy / Ajak orang-orang tersayang" + upload musik DIPINDAH ke Area Mempelai (?mode=mempelai) — tidak terlihat tamu

## Arsitektur
- Backend: FastAPI `/api` — wishes, rsvp-summary (agregasi MongoDB), music upload/get, files streaming via Emergent Object Storage (requests + EMERGENT_LLM_KEY)
- Frontend: React + Tailwind + framer-motion + lenis; audio via <audio> ke /api/files/...
- DB: wishes, files (soft-delete), settings (musik aktif)

## Endpoint kunci
- GET/POST /api/wishes
- GET /api/rsvp-summary
- POST /api/music (upload), GET /api/music
- GET /api/files/{path}

## Backlog
- P1: Hitung jumlah tamu per RSVP (bawa berapa orang)
- P2: Tambah section ayat suci (QS Ar-Rum 21), ganti foto hero/galeri
- Selesai: daftar nama RSVP di Area Mempelai; musik auto-pause saat video diputar

## Riwayat
- 09 Okt 2026: Iterasi 2 (musik upload, RSVP summary, kalender, hadiah, 3D, Area Mempelai); ucapan diganti bernuansa Islam; Love Story diisi cerita asli dari pengguna (sekolah, 02 Jul 2026, pinangan 03 Okt 2026, akad 01 Nov 2026)
- 09 Okt 2026: 2 video dikompres (ffmpeg crf 27 + faststart: 18,7MB→12,9MB dan 7,6MB→2,3MB) di /frontend/public/videos + section "Momen yang hidup" (05), preload=metadata + poster; 2 foto baru dikompres ke /frontend/public/photos (galeri kini 7 foto)
- 09 Okt 2026: Hapus ucapan uji; ringkasan RSVP pindah ke Area Mempelai; share WA 2 langkah (isi nama tamu dulu); nama tamu dari ?to= TERKUNCI (tidak bisa diedit tamu); Area Mempelai kini dijaga PIN (MEMPELAI_PIN di .env, JWT 12 jam, upload musik butuh token); tombol Area Mempelai disembunyikan pada tautan tamu (?to=)
- 09 Okt 2026: Rekening asli Mandiri 60012941203 a.n. Lira (BCA dihapus); kalimat hadiah disederhanakan
- 09 Okt 2026: Pola latar diamond dihapus (latar polos); efek bunga emas jepun berjatuhan (SVG, 14 kelopak, komponen GoldFlowers) terinspirasi gelungan mempelai wanita
