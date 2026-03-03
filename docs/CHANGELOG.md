# Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

## [Unreleased] - 2026-03-04

### 🚀 Fitur Baru
- **Logika "Container (kosong)"**:
  - Frontend: Saat operator memilih "Container (kosong)", kolom "Keterangan Barang" otomatis terisi "Kontainer kosong" dan di-disable untuk mencegah input manual yang tidak konsisten.
  - Backend: Statistik rekapitulasi kini memproses kontainer kosong secara terpisah namun tetap muncul di daftar barang.
- **Admin Dashboard Trend**:
  - Perbaikan query untuk menangani data dengan nama muatan kosong.
  - Fallback otomatis ke nama komoditas jika detail barang tidak diisi.

### 🐛 Bug Fixes
- **Fix Error 500 pada Cetak PDF Rekap**:
  - Masalah: Server crash saat mencoba mencetak PDF jika terdapat data kontainer kosong (KeyError: '20_ton').
  - Solusi: Menambahkan inisialisasi variabel statistik tonase (`20_ton`, `40_ton`) untuk kategori kontainer kosong di `admin.py`.
  - Penambahan *error handling* (try-catch) pada loop kalkulasi statistik agar satu data korup tidak mematikan seluruh request.
- **Fix Data Hilang di Grafik Tren**:
  - Masalah: Data dengan `nama_muatan` string kosong ("") tidak muncul di grafik.
  - Solusi: Update SQL Query di `dashboard.py` menggunakan `COALESCE(NULLIF(nama_muatan, ''), komoditas, 'Tanpa Nama')`.

### 🛠️ Maintenance
- **Pembersihan Data**: Script `clear_data.py` diperbarui untuk menghapus data transaksi (kapal, log) namun tetap mempertahankan data akun user (users).
- **Seeder**: Script `seed_direct.py` ditambahkan untuk seeding data yang lebih cepat dan terstruktur, termasuk pembuatan akun admin default jika belum ada.

---

## [2.0.0] - 2026-02-28

### Initial Release
- Peluncuran versi Web Entries berbasis React + FastAPI.
- Fitur lengkap Operator (Entry, Dashboard) dan Admin (Rekap, User Management).
