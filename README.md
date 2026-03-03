# <img src="frontend/public/logo-bps.png" alt="Logo BPS - Web Entries Admin" height="40" style="vertical-align: middle;"> Web Entries Project

**Sistem Manajemen & Rekapitulasi Laporan Operasional Kapal Pelabuhan**

Project ini adalah solusi modern berbasis web untuk menggantikan proses pelaporan manual. Dibangun dengan **React (Vite)** di frontend dan **FastAPI (Python)** di backend, sistem ini menawarkan performa tinggi, kemudahan penggunaan, dan fleksibilitas dalam pengolahan data.

---

## 🌟 Fitur Utama

### 🚢 Operator Area
- **Dashboard Kinerja**: Visualisasi tren muatan bulanan pribadi.
- **Formulir Entri Cerdas**: 
  - Input data kapal, muatan, dan penumpang.
  - **Auto-fill** untuk komoditas tertentu (misal: "Container (kosong)" otomatis menonaktifkan input detail barang).
  - Validasi data real-time.
- **Laporan Saya**: Riwayat entri data dengan status (Submitted, Approved, Rejected).
- **Cetak Laporan**: Export bukti lapor harian/bulanan.

### 👮 Admin Area
- **Dashboard Eksekutif**: Ringkasan aktivitas pelabuhan (Total Unit, GRT, LOA) secara *real-time*.
- **Tren Analisis**: Grafik interaktif (Line Chart) untuk memantau fluktuasi bongkar/muat per komoditas.
- **Rekap Data Entries**:
  - Filter canggih berdasarkan kategori pelayaran (Luar Negeri, Dalam Negeri, Perintis, Rakyat).
  - **Export PDF Resmi**: Laporan rekapitulasi siap cetak dengan format standar BPS.
  - **Export Excel**: Data mentah untuk analisis lanjutan.
  - Dukungan penuh untuk perhitungan statistik kontainer (20ft, 40ft, Tonase).
- **Manajemen User**: Tambah/Edit/Hapus/Reset Password akun operator.

---

## 🏗️ Teknologi yang Digunakan

### Frontend
- **Core**: React 19, Vite
- **UI Framework**: Tailwind CSS 3.4
- **State Management**: React Hooks
- **Charting**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Core**: FastAPI (Python 3.10+)
- **Database**: MySQL 8.0 / MariaDB
- **ORM/Driver**: mysql-connector-python (Raw SQL optimized for complex reporting)
- **Authentication**: JWT (JSON Web Token) + BCrypt Password Hashing
- **Reporting**: ReportLab (PDF Generation), OpenPyXL (Excel)

---

## 🚀 Memulai Project (Quick Start)

Panduan lengkap instalasi dapat dilihat di **[docs/SETUP.md](docs/SETUP.md)**.

### Ringkasan Langkah:
1.  **Database**: Buat database `db_entries`.
2.  **Backend**:
    ```bash
    cd backend
    python -m venv venv
    venv\Scripts\activate  # Windows
    pip install -r requirements.txt
    python setup_db.py     # Buat tabel
    python seed_direct.py  # Isi data awal
    python main.py         # Jalankan server (Port 8001)
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev            # Jalankan web (Port 5173)
    ```

---

## 📂 Struktur Folder

Project ini menggunakan struktur monorepo sederhana:
- `/backend`: Kode sumber API server, logika bisnis, dan koneksi database.
- `/frontend`: Kode sumber aplikasi web React.
- `/database`: Skema SQL (`schema.sql`) untuk referensi manual.
- `/docs`: Dokumentasi teknis lengkap.

---

## 📝 Catatan Pembaruan (Changelog)

Lihat **[docs/CHANGELOG.md](docs/CHANGELOG.md)** untuk riwayat perubahan terbaru, perbaikan bug, dan penambahan fitur.

---

## 👥 Kontributor & Lisensi

Dikembangkan untuk **Badan Pusat Statistik (BPS) Pelabuhan Indonesia**.
*Versi 2.0.0 Enterprise Edition*
