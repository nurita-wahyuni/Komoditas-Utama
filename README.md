<div align="center">

# KOMUT (Komoditas Utama)
### Port Operational Reporting System

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## 📋 Table of Contents
- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running The App](#running-the-app)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 📌 Tentang Proyek

**KOMUT (Komoditas Utama) adalah aplikasi web khusus yang dirancang untuk pelaporan PDRB. Website ini menyediakan platform digital yang efisien untuk merekam, mengelola, dan menganalisis pergerakan kapal pelabuhan.

Aplikasi ini berfungsi untuk memastikan bahwa pelaporan terstandarisasi, data akurat, dan wawasan (insights) mudah diakses melalui dasbor dinamis dan pembuatan laporan otomatis (PDF). Dengan mendigitalkan proses pelaporan manual, KOMUT secara signifikan mengurangi tingkat kesalahan dan meningkatkan kecepatan penyebaran data operasional yang krusial untuk perhitungan ekonomi daerah.

---

## ✨ Fitur

### 🔴 Fitur Admin:
- **Dasbor Komprehensif**: Melihat tren real-time dari realisasi muatan (Bongkar/Muat) di semua kategori.
- **Rekonsiliasi Data**: Meninjau, menyetujui, atau menolak kiriman dari berbagai operator.
- **Pelaporan Lanjutan**: Menghasilkan laporan rekapitulasi bulanan dan tahunan.
- **Ekspor Format PDF**: Mengekspor data operasional ke format PDF profesional (standar BPS).
- **Manajemen Pengguna**: Membuat, memperbarui, dan mengelola akun serta izin operator.
- **Log Audit**: Melacak tindakan administratif dan perubahan di seluruh sistem.

### 🟢 Fitur Operator:
- **Sistem Entri Efisien**: Memasukkan data kapal (LOA, GRT) dan detail muatan (Komoditas, Tonase, Penumpang).
- **Pengiriman Massal**: Melaporkan beberapa entri sekaligus untuk periode tertentu.
- **Manajemen Draf**: Menyimpan progres secara lokal dan melanjutkan entri sebelum pengiriman akhir.
- **Dasbor Pribadi**: Melacak kinerja dan statistik pelaporan pribadi.

### ⚙️ Fitur Sistem:
- **Autentikasi Aman**: Autentikasi berbasis JWT dengan kontrol akses berbasis peran (RBAC).
- **Desain Responsif**: UI elegan menggunakan Tailwind CSS, dioptimalkan untuk tampilan desktop dan tablet.
- **Validasi Real-time**: Validasi formulir cerdas untuk memastikan integritas data sebelum pengiriman.
- **Pencatatan Otomatis**: Pencatatan di seluruh sistem untuk pengiriman otomatis dan kesalahan.

---

## 🛠️ Tech Stack

### Backend:
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | High-performance Web Framework |
| MySQL Connector | 8.0 | Database Communication |
| python-jose | 3.3.0 | JWT Token Handling |
| passlib | 1.7.4 | Password Hashing (Bcrypt) |
| Pydantic | 2.x | Data Validation & Settings |
| Uvicorn | Latest | ASGI Server |

### Frontend:
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0 | UI Library |
| Vite | 8.0 | Build Tool & Dev Server |
| Tailwind CSS | 3.4 | Utility-first Styling |
| Recharts | 3.7 | Data Visualization |
| Framer Motion | 12.0 | Smooth UI Animations |
| Axios | 1.x | API Communication |

### Database:
| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0 | Relational Database Management |

---

## 📁 Project Structure

```text
simoppel/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, Database config
│   │   ├── routers/        # API Routes (auth, entries, admin, etc.)
│   │   ├── schemas/        # Pydantic models
│   │   ├── services/       # Business logic & Seeding
│   │   └── main.py         # App entry point
│   ├── .env                # Backend environment variables
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── features/       # Feature-based modules (admin, operator, auth)
│   │   ├── services/       # API calling logic
│   │   ├── App.jsx         # Main routing
│   │   └── index.css       # Global styles & Tailwind
│   ├── .env                # Frontend environment variables
│   └── package.json        # Frontend dependencies
├── database/
│   └── schema.sql          # Database structure & seed data
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python >= 3.9
- Node.js >= 18
- MySQL >= 8.0
- pip & npm

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/nurita-wahyuni/Komoditas-Utama.git
cd Komoditas-Utama
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### 4. Database Setup
```bash
# Create the database and tables
mysql -u root -p < database/schema.sql
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_NAME=db_entries
DB_USER=root
DB_PASSWORD=your_password

SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## ▶️ Running The App

### Development Mode

#### Start Backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

#### Start Frontend:
```bash
cd frontend
npm run dev
```

#### Access The App:
- **Frontend**  → [http://localhost:5173](http://localhost:5173)
- **Backend API** → [http://localhost:8000](http://localhost:8000)
- **Swagger UI** → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Documentation

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | No | Authenticate user and get JWT |
| GET | `/api/users/me` | Yes | Get current logged-in user profile |
| PUT | `/api/users/me/profile` | Yes | Update current user's profile |
| PUT | `/api/users/me/password` | Yes | Change current user's password |

### Entry Endpoints
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/entries` | Yes | All | Get list of entries (can be grouped) |
| POST | `/api/entri` | Yes | Operator | Save a single ship entry |
| POST | `/api/entries/report` | Yes | Operator | Submit a batch of entries |
| PUT | `/api/entries/{id}` | Yes | Operator | Update an existing entry |
| DELETE | `/api/entries/{id}` | Yes | Operator | Delete an entry |

### Dashboard Endpoints
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard/trend` | Yes | All | Get cargo realization trend data |
| GET | `/api/dashboard/stats` | Yes | All | Get quick stats for today/all-time |
| GET | `/api/dashboard/distribution`| Yes | All | Get commodity volume distribution |

### Admin Endpoints
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/operators` | Yes | Admin | List all registered operators |
| POST | `/api/operators` | Yes | Admin | Create a new operator account |
| GET | `/api/admin/rekap` | Yes | Admin | Get detailed rekap for reports |
| PUT | `/api/admin/entries/{id}`| Yes | Admin | Update any entry (Admin override) |

---

## 🗄️ Database Schema

### Tables Overview
| Table | Description |
|--------------|--------------------------|
| `users` | Stores account data for Admins and Operators |
| `ship_entries` | Primary table for operational ship and cargo records |
| `admin_audit_logs`| Tracks sensitive administrative changes |
| `auto_submit_logs`| Logs for automated system processes |

### Relationships
- **users (1)** ──── **(many) ship_entries**: Each entry is linked to an `operator_id`.
- **users (1)** ──── **(many) admin_audit_logs**: Logs linked to `admin_id`.

---

## 👥 User Roles

### 🔴 Admin (Administrator)
- **Overview Dashboard**: Access to system-wide cargo trends.
- **Reporting**: Generate and export operational reports to PDF/Excel.
- **Management**: full CRUD on Operator accounts.
- **Quality Control**: Edit or delete any entry to ensure data accuracy.

### 🟢 Operator
- **Data Reporting**: Specialized forms for single or batch ship entry.
- **Self-Tracking**: Personal dashboard to monitor reporting history.
- **Drafting**: Capability to save reports as drafts before final submission.

---

## 📄 License
This project is licensed under the **MIT License**.

---
<div align="center">
Developed for Port Operational Efficiency. © 2026 KOMUT.
</div>
