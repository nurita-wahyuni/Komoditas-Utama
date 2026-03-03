# 🔌 API Documentation

Dokumentasi ini menjelaskan endpoint utama yang tersedia di backend FastAPI. Untuk dokumentasi interaktif dan uji coba langsung, jalankan backend dan buka **Swagger UI** di: `http://localhost:8001/docs`.

---

## 🔐 Authentication

### Login
- **Endpoint**: `POST /api/login`
- **Body**:
  ```json
  {
    "username": "email@example.com", // Menggunakan field 'username' untuk email (standar OAuth2)
    "password": "your_password"
  }
  ```
- **Response**: Access Token (JWT)

---

## 🚢 Operator Endpoints

### Get Ship Entries (Laporan Saya)
- **Endpoint**: `GET /api/entries`
- **Query Params**: `page`, `limit`, `search`
- **Deskripsi**: Mengambil daftar laporan kapal yang diinput oleh operator yang sedang login.

### Create Ship Entry
- **Endpoint**: `POST /api/entries`
- **Body**: JSON Data Kapal (nama_kapal, grt, loa, muatan, dll)
- **Deskripsi**: Mengirim data laporan baru. Status awal: `SUBMITTED`.

### Get Dashboard Stats (Operator)
- **Endpoint**: `GET /api/dashboard/operator`
- **Deskripsi**: Statistik ringkas (Total Entri bulan ini, Status terakhir).

---

## 👮 Admin Endpoints

### Get Rekapitulasi Entries (Screen View)
- **Endpoint**: `GET /api/admin/rekap-entries`
- **Query Params**: 
  - `category`: (Luar Negeri, Dalam Negeri, Perintis, Rakyat)
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
- **Deskripsi**: Mengambil data rekapitulasi untuk ditampilkan di tabel dashboard admin. Termasuk statistik Unit, GRT, LOA, dan breakdown Bongkar/Muat.

### Get Rekapitulasi Entries (Full/PDF View)
- **Endpoint**: `GET /api/admin/rekap-entries/all`
- **Query Params**: `start_date`, `end_date`
- **Deskripsi**: Mengambil data rekapitulasi LENGKAP untuk semua kategori sekaligus. Digunakan khusus untuk generate laporan PDF/Excel. Endpoint ini memiliki logika perhitungan statistik kontainer yang detail.

### Dashboard Trend Analysis
- **Endpoint**: `GET /api/dashboard/trend`
- **Query Params**: `tahun`, `jenis_trend` (Bongkar/Muat)
- **Deskripsi**: Data untuk grafik garis (Line Chart) tren volume muatan bulanan.

### Auto Submit Logs
- **Endpoint**: `GET /api/admin/auto-submit-logs`
- **Deskripsi**: Audit log aktivitas sistem.

### User Management
- **Endpoint**: `GET /api/users` (List Users)
- **Endpoint**: `POST /api/users` (Create User)
- **Endpoint**: `PUT /api/users/{id}` (Update User/Reset Password)
- **Endpoint**: `DELETE /api/users/{id}` (Delete User)

---

## 📦 Data Models (Schema)

### ShipEntry
Representasi data utama laporan kapal. Field penting:
- `kategori_pelayaran`: Enum (Luar Negeri, Dalam Negeri, Perintis, Rakyat)
- `jenis_kegiatan`: Enum (Bongkar, Muat)
- `jenis_muatan`: Enum (Barang, Manusia, Hewan)
- `nama_muatan`: String (Detail barang)
- `satuan_muatan`: String (Ton, M3, Unit, Teus, dll)
- `container_stats`: JSON (Khusus kontainer: 20ft/40ft, Status Isi/Kosong)

### User
- `id`: Integer
- `email`: String (Unique)
- `nama`: String
- `role`: Enum (ADMIN, OPERATOR)
- `is_active`: Boolean
