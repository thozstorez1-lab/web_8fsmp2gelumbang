# 🚀 8F WEB CLASS — GALAXY PREMIUM

> **Tagline:** *“ONE CLASS, ONE FAMILY, ONE FUTURE.”*  
> **Identitas Pembuat:** **CREATED BY THOZ — WAKLENG**  
> **Identitas Wali Kelas:** **WALI KELAS: BUK BIBA**  
> **Tema:** Galaxy Premium (Luar Angkasa, Bintang Bergerak, Neon Violet, Biru Elektrik, Glassmorphism)

---

## 🌌 Tentang Website
**8F WEB CLASS** adalah platform digital resmi yang dibangun untuk mendukung komunikasi, pusat informasi jadwal dan tugas, dokumentasi kenangan kelas, serta mempererat kebersamaan seluruh siswa-siswi kelas 8F di bawah bimbingan Wali Kelas **Buk Biba**.

---

## ✨ Fitur-Fitur Utama yang Berfungsi

1. **Halaman Pembuka (Landing Page):**
   - Animasi emblem logo 8F Galaxy yang futuristik.
   - Slogan utama *"ONE CLASS, ONE FAMILY, ONE FUTURE."*
   - Kartu Wali Kelas **BUK BIBA** & Kartu Website Creator **THOZ — WAKLENG**.
   - Sorotan pengumuman terbaru dan statistik cepat kelas.
   - Tombol cepat **Scan QR & Bagikan Web**.

2. **Menu Berbagi Web & QR Code (Permintaan Khusus User):**
   - Penjana QR Code interaktif beresolusi tinggi langsung di peramban.
   - Tombol satu sentuhan **Salin Link Website**.
   - Tombol **Unduh Gambar QR Code (PNG)** untuk dicetak atau ditempel di mading kelas.
   - Tombol **Bagikan Langsung** (Web Share API) & Quick Share ke **WhatsApp** dan **Telegram**.
   - Panduan scan cepat kamera HP Android & iPhone.

3. **Dashboard Utama:**
   - Jam digital dan penanggalan real-time.
   - Sapaan personal untuk siswa dan guru.
   - Deteksi otomatis jadwal pelajaran hari ini dan petugas piket hari ini.
   - Ringkasan tugas dan batas pengumpulan mendatang.

4. **Chat Global Real-Time:**
   - Obrolan serentak antar seluruh siswa 8F menggunakan listener Firestore `onSnapshot`.
   - Balasan pesan (*reply thread*), reaksi emoji (*❤️, 🔥, 👍, 😂, 🚀, 🎉*).
   - Pengamanan pesan dan penghapusan hanya oleh pengirim atau admin.

5. **Chat Pribadi Antar-Anggota:**
   - Percakapan 1-on-1 antar sesama teman kelas untuk tugas kelompok dan diskusi personal.

6. **Tugas & PR (Homework Hub):**
   - Daftar tugas per mata pelajaran dengan tenggat waktu.
   - Fitur penanda mandiri *Sudah Selesai* oleh masing-masing siswa.
   - Penambahan, pengeditan, dan penghapusan tugas oleh Admin.

7. **Jadwal Pelajaran & Jadwal Piket Mingguan:**
   - Jadwal Senin sampai Sabtu dengan penanda sesi jam, ruangan, dan buku catatan.
   - Jadwal giliran regu piket kebersihan kelas harian.

8. **Kenangan & Galeri Foto/Video:**
   - Album dokumentasi kegiatan kelas, praktikum sains, pentas seni, dan lomba.
   - Fitur apresiasi *Like* dari siswa.
   - Modal preview ukuran besar dan pemutar video interaktif.

9. **Kalender Kelas:**
   - Agenda ujian semester, acara sekolah, dan hari penting kelas 8F.

10. **Polling & Kotak Saran:**
    - Pemungutan suara voting kelas dengan kalkulasi persentase suara real-time.
    - Kotak saran dan aspirasi dengan opsi identitas anonim dan balasan resmi dari Buk Biba/Pengurus.

11. **Peraturan & Pencapaian Kelas:**
    - Tata tertib norma persaudaraan anti-bullying dan kedisiplinan.
    - Lemari piala prestasi dan dokumentasi pencapaian positif kelas 8F.

12. **Sistem Akun & Keamanan Terpadu:**
    - Login Google Popup resmi dengan sinkronisasi profil.
    - Tiga tingkatan hak akses: **SUPER ADMIN** (THOZ), **ADMIN** (Buk Biba & Pengurus), dan **ANGGOTA** (Siswa).
    - `firestore.rules` berbasis ABAC (Attribute-Based Access Control) tanpa celah celah eksploitasi.

---

## 🛠️ Arsitektur Teknologi
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, QR Code Generator.
- **Backend & Database:** Google Cloud Firestore (Enterprise Edition), Firebase Authentication.
- **Hosting / Runtime:** Google Cloud Run (Node 22 / Vite).

---

## 🚀 Panduan Menjalankan & Deployment

### 1. Menjalankan di Lingkungan Lokal
```bash
# 1. Install seluruh dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

### 2. Membangun Kode Produksi (Build)
```bash
npm run build
```

### 3. Mengatur Dua Admin Utama Secara Aman
- Super Admin pertama telah dikonfigurasikan otomatis untuk akun email pengembang: `thozstorez1@gmail.com` (**THOZ — WAKLENG**).
- Untuk mengangkat akun Wali Kelas (**BUK BIBA**) atau ketua kelas menjadi Admin, buka menu **Dashboard Admin** -> Tab **Otorisasi Anggota**, lalu pilih role `Admin` pada baris akun yang bersangkutan.

---

## 📱 Cara Menguji dari Handphone Lain
1. Buka website 8F Web Class di laptop/perangkat utama.
2. Klik tombol **"QR Web"** di pojok kanan atas navbar.
3. Buka aplikasi kamera di HP Android atau iPhone, arahkan ke layar laptop.
4. Sentuh link notifikasi kuning/biru yang muncul di layar HP untuk membuka website secara instan!

---
© 2026 **8F WEB CLASS** • Created by **THOZ — WAKLENG** • Wali Kelas: **BUK BIBA**
