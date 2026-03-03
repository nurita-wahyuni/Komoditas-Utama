-- ==============================================================================
-- Consolidated Database Schema
-- Project: Port Operational Reporting System (FastAPI + MySQL)
-- Description: Single source of truth for database structure.
--              Includes users, ship_entries, and performance optimizations.
-- ==============================================================================

-- 1. Setup Database
CREATE DATABASE IF NOT EXISTS `db_entries` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_entries`;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE, -- Prepared for Auth Refactor
    `password_hash` VARCHAR(255), -- Prepared for Auth Refactor
    `role` ENUM('ADMIN', 'OPERATOR', 'VIEWER') NOT NULL DEFAULT 'OPERATOR',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Ship Entries Table
CREATE TABLE IF NOT EXISTS `ship_entries` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `operator_id` INT,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
    
    -- Core Data
    `tanggal_laporan` DATE NOT NULL,
    `kategori_pelayaran` ENUM('Luar Negeri', 'Dalam Negeri', 'Perintis', 'Rakyat') NOT NULL,
    `nama_kapal` VARCHAR(150) NOT NULL,
    `jenis_kegiatan` ENUM('Bongkar', 'Muat') NOT NULL DEFAULT 'Bongkar',
    
    -- Additional Identity (Added v3.2)
    `bendera` VARCHAR(50), -- Dropdown
    `pemilik_agen` VARCHAR(150), -- Text input / Autocomplete
    
    -- Dimensions & Metrics
    `grt` DECIMAL(15, 2) DEFAULT 0,
    `loa` DECIMAL(10, 2) DEFAULT 0,
    
    -- Cargo Details (New Structure)
    `jenis_muatan` ENUM('Barang', 'Hewan', 'Manusia') NOT NULL DEFAULT 'Barang',
    `komoditas` VARCHAR(100) DEFAULT NULL, -- New field for dropdown commodity
    `nama_muatan` VARCHAR(150), -- Nama Barang / Jenis Hewan
    `jumlah_muatan` DECIMAL(15, 3) DEFAULT 0, -- Jumlah Satuan / Jumlah Ekor / Jumlah Manusia
    `satuan_muatan` VARCHAR(50), -- Ton, MT, Ekor, Orang
    `jenis_kemasan` VARCHAR(50), -- Jenis Kemasan (Barang/Hewan)

    -- Legacy / Mapped Fields (For Backward Compatibility or Specific Reports)
    `berat_ton` DECIMAL(15, 3) DEFAULT 0, -- Maps to jumlah_muatan if Barang
    `jumlah_penumpang` INT DEFAULT 0, -- Maps to jumlah_muatan if Manusia
    
    -- Container Details (Optional/Expansion)
    `teus_20_box` INT DEFAULT 0,
    `teus_40_box` INT DEFAULT 0,
    `container_status` ENUM('Isi', 'Kosong', 'N/A') DEFAULT 'N/A',

    -- Schedule
    `pelabuhan_asal` VARCHAR(100), -- Dropdown
    `pelabuhan_tujuan` VARCHAR(100), -- Dropdown
    `tanggal_kedatangan` DATETIME DEFAULT NULL,
    `tanggal_tambat` DATETIME DEFAULT NULL, -- Added v3.2
    `tanggal_keberangkatan` DATETIME DEFAULT NULL,
    `dermaga` VARCHAR(100), -- Dropdown
    `keterangan` TEXT, -- Textarea max 500 chars (TEXT fits plenty)
    
    -- Submit Metadata (v3.3)
    `submitted_at` DATETIME DEFAULT NULL,
    `submit_method` ENUM('MANUAL', 'AUTO') DEFAULT 'MANUAL',

    -- Re-open Metadata (Admin)
    `reopened_by_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `reopened_at` DATETIME DEFAULT NULL,
    `reopened_by` INT DEFAULT NULL,
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT `fk_ship_entries_operator` 
        FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
        
    -- Indexes for Performance
    INDEX `idx_entry_operator` (`operator_id`),
    INDEX `idx_entry_status` (`status`),
    INDEX `idx_entry_date` (`tanggal_laporan`),
    INDEX `idx_entry_category` (`kategori_pelayaran`),
    INDEX `idx_entry_composite_report` (`operator_id`, `tanggal_laporan`, `status`) -- For efficient reporting queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5B. Create Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NULL,
    `action` VARCHAR(50) NOT NULL,
    `operator_id` INT NULL,
    `affected_rows` INT DEFAULT 0,
    `meta_json` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_admin_audit_created_at` (`created_at`),
    INDEX `idx_admin_audit_action` (`action`),
    INDEX `idx_admin_audit_operator` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Holidays Table (v3.3)
CREATE TABLE IF NOT EXISTS `holidays` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tanggal` DATE UNIQUE NOT NULL,
    `nama` VARCHAR(100),
    INDEX `idx_holiday_date` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Auto Submit Logs Table (v3.3)
CREATE TABLE IF NOT EXISTS `auto_submit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('SUCCESS', 'FAILED', 'SKIPPED') NOT NULL,
    `details` TEXT,
    `rows_affected` INT DEFAULT 0,
    INDEX `idx_log_executed_at` (`executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Initial Seed Data (Idempotent)
-- Admin User
INSERT IGNORE INTO `users` (`id`, `nama`, `role`, `email`, `password_hash`) VALUES 
(999, 'Administrator', 'ADMIN', 'admin@example.com', '$2b$12$jDy7GASQcKluWx5hQ15UiuAiQs5/WTA1ZK41Dd7lUNee4ZEkxTTEK');

-- Default Operators (Examples)
INSERT IGNORE INTO `users` (`id`, `nama`, `role`, `email`, `password_hash`) VALUES 
(1, 'Andi Pratama', 'OPERATOR', 'andi@example.com', '$2b$12$jDy7GASQcKluWx5hQ15UiuAiQs5/WTA1ZK41Dd7lUNee4ZEkxTTEK'),
(2, 'Budi Santoso', 'OPERATOR', 'budi@example.com', '$2b$12$jDy7GASQcKluWx5hQ15UiuAiQs5/WTA1ZK41Dd7lUNee4ZEkxTTEK');

-- Sample Holidays (v3.3)
INSERT IGNORE INTO `holidays` (`tanggal`, `nama`) VALUES 
('2026-01-01', 'Tahun Baru 2026'),
('2026-01-29', 'Tahun Baru Imlek 2577'),
('2026-03-20', 'Hari Suci Nyepi'),
('2026-03-21', 'Cuti Bersama Nyepi'),
('2026-03-31', 'Idul Fitri 1447 H'),
('2026-04-01', 'Idul Fitri 1447 H'),
('2026-05-01', 'Hari Buruh Internasional'),
('2026-05-14', 'Kenaikan Yesus Kristus'),
('2026-06-01', 'Hari Lahir Pancasila'),
('2026-08-17', 'Hari Kemerdekaan RI'),
('2025-12-25', 'Hari Raya Natal'),
('2025-12-26', 'Cuti Bersama Natal');
