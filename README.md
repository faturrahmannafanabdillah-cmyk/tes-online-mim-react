# Tes Online - PT Multi Indomandiri (WINGS Group)

Aplikasi portal tes online dan asesmen rekrutmen berbasis web untuk **PT Multi Indomandiri (WINGS Group)**, telah di-rewrite secara penuh menjadi aplikasi modern **React (TypeScript)** dengan Vite dan Tailwind CSS.

## Fitur Utama

1. **Tata Tertib & Registrasi Kandidat**:
   - Validasi persetujuan aturan ujian (Anti-Cheat & Kode Etik).
   - Pengisian Token Ujian (mendukung URL parameter `?token=MIM-XXXX-XXXX`).
   - Pilihan posisi pekerjaan dinamis terintegrasi ke backend Google Apps Script.
   - Verifikasi wajah (Selfie) dengan kompresi kamera otomatis di sisi klien (Canvas scaling).

2. **Sistem Pengawasan & Proctoring Aktif**:
   - Deteksi perpindahan tab browser (`visibilitychange`) dengan mekanisme debounce.
   - Deteksi pembukaan DevTools / Inspect element.
   - Pencegahan tombol pintas terlarang (F12, Inspect shortcut, PrintScreen, Copy/Paste).
   - Indikator live status `REC: Layar Diawasi`.
   - Watermark dinamis transparan berputar dengan nama dan email kandidat.
   - Batas toleransi 3 kali pelanggaran sebelum diskualifikasi otomatis.

3. **Modul Ujian & Asesmen**:
   - **Tahap 1: Tes Verbal** (15 menit) - Sinonim, antonim, dan penalaran analogi kata.
   - **Tahap 2: Tes Berhitung** (45 menit) - Deret angka, logika kuantitatif, dan soal cerita industri.
   - **Tes Army Alpha (Subtes Psikotes)** - Fitur interaktif lingkaran input, deret angka coret, kata coret YA/TIDAK, serta pemodelan irisan bentuk geometris SVG dengan arahan audio/suara terintegrasi.
   - Navigasi nomor soal fleksibel dengan penandaan warna (Terjawab, Belum, Ditandai).
   - Validasi kelengkapan soal sebelum berpindah tahap atau kirim jawaban.

4. **Ketahanan Jaringan & Penyimpanan Sesi**:
   - Sesi ujian tersimpan otomatis ke `localStorage` untuk mengantisipasi refresh halaman atau gangguan koneksi.
   - Mekanisme pengiriman ulang (*retry*) jika server Apps Script mengalami kendala jaringan.
   - Fallback offline bank soal berstandar psikotes industri.

## Arsitektur Teknologi

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Build Tool**: Vite
- **Backend API**: Google Apps Script Web App (GAS)
