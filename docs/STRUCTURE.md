# Struktur Folder Project

Berikut adalah struktur folder terbaru yang mencerminkan kondisi terkini project **Web Entries**.

## 📂 Root Directory
```
d:/web-entries/
├── backend/               # Kode sumber Backend (Python/FastAPI)
├── frontend/              # Kode sumber Frontend (React/Vite)
├── database/              # Skema SQL manual
└── docs/                  # Dokumentasi Project (Anda berada di sini)
```

## 🖥️ Backend Structure (`/backend`)
Backend menggunakan arsitektur modular dengan pemisahan *Router-Service-Core*.

```
backend/
├── app/
│   ├── core/              # Konfigurasi inti
│   │   ├── config.py      # Load env vars (DB_HOST, SECRET_KEY)
│   │   ├── database.py    # Koneksi Database MySQL
│   │   └── security.py    # Logic Auth (JWT, Password Hash)
│   │
│   ├── routers/           # API Endpoints (Controller)
│   │   ├── auth.py        # Login & User Info
│   │   ├── entries.py     # CRUD Data Kapal (Operator)
│   │   ├── admin.py       # Fitur Admin (Rekap, User Mgmt, Auto-submit logs)
│   │   └── dashboard.py   # Data Visualisasi Dashboard & Tren
│   │
│   ├── schemas/           # Pydantic Models (Validation)
│   │   └── schemas.py     # Request/Response Models
│   │
│   ├── services/          # Business Logic
│   │   └── seeder.py      # Logic Generate Dummy Data (Internal)
│   │
│   └── main.py            # Entry Point Aplikasi (FastAPI instance)
│
├── .env                   # File Environment Variables (Rahasia)
├── requirements.txt       # Daftar Library Python
├── main.py                # Script Runner (Uvicorn wrapper)
├── setup_db.py            # Script inisialisasi tabel database
├── seed_direct.py         # Script seeding data (Admin + Dummy Data)
└── clear_data.py          # Script pembersihan data transaksi (Reset)
```

## 🎨 Frontend Structure (`/frontend`)
Frontend menggunakan pendekatan **Feature-Based** untuk memisahkan domain logika dan komponen.

```
frontend/src/
├── features/              # PENGELOMPOKAN FITUR UTAMA
│   ├── auth/              # Fitur Otentikasi
│   │   ├── pages/         # Halaman Login
│   │   └── components/    # ProtectedRoute
│   │
│   ├── admin/             # Fitur Admin
│   │   ├── pages/         # Dashboard, Rekap Entries, User Mgmt
│   │   └── components/    # Komponen Admin (RekapTable, UserForm)
│   │
│   └── operator/          # Fitur Operator
│       ├── pages/         # Entry Form, Dashboard Operator, Laporan Saya
│       └── components/    # Komponen Operator (EntryForm, HistoryTable)
│
├── components/            # KOMPONEN SHARED
│   ├── layout/            # Layout Global (Sidebar, Topbar)
│   ├── shared/            # Komponen Umum (SummaryCard, Modal)
│   └── ui/                # UI Primitives (Button, Input, Select)
│
├── services/              # API LOGIC
│   └── api.js             # Centralized Axios & Endpoint Functions
│
├── context/               # STATE MANAGEMENT
│   └── AuthContext.jsx    # Global User State (Login/Logout)
│
├── App.jsx                # Routing Utama (React Router)
└── main.jsx               # Entry Point React
```
