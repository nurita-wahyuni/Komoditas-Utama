
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.encoders import jsonable_encoder
from typing import Optional
from datetime import date, timedelta, datetime
import decimal
from app.core.database import get_db_connection
from app.core.security import get_current_user, get_password_hash
from app.services.seeder import seed_sample_data
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/admin/auto-submit-logs")
def get_auto_submit_logs(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    filter: Optional[str] = 'all', # '1_month', '3_months', '6_months', 'all'
    sort: Optional[str] = 'newest',
    user: dict = Depends(get_current_user)
):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Akses ditolak")
        
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    cursor = conn.cursor(dictionary=True)
    try:
        offset = (page - 1) * limit
        
        # Base Query: Grouped entries for a simpler view
        base_query = """
            SELECT 
                MIN(se.id) as id,
                se.submitted_at as timestamp,
                se.submitted_at as date,
                se.operator_id,
                u.nama as operator_name,
                COUNT(*) as total_entries,
                GROUP_CONCAT(DISTINCT se.jenis_kegiatan SEPARATOR ', ') as activities
            FROM ship_entries se
            JOIN users u ON se.operator_id = u.id
            WHERE se.status IN ('SUBMITTED', 'APPROVED')
              AND se.submitted_at IS NOT NULL
              AND (se.berat_ton > 0 OR se.jumlah_penumpang > 0 OR se.loa > 0 OR se.grt > 0)
        """
        
        params = []
        
        # Apply Search (Operator Name)
        if search:
            base_query += " AND u.nama LIKE %s"
            params.append(f"%{search}%")
            
        # Apply Time Filter (Based on Tanggal Laporan)
        if filter == '1_month':
            base_query += " AND se.tanggal_laporan >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"
        elif filter == '3_months':
            base_query += " AND se.tanggal_laporan >= DATE_SUB(NOW(), INTERVAL 3 MONTH)"
        elif filter == '6_months':
            base_query += " AND se.tanggal_laporan >= DATE_SUB(NOW(), INTERVAL 6 MONTH)"
        elif filter == 'all':
             base_query += " AND se.tanggal_laporan >= DATE_SUB(NOW(), INTERVAL 1 YEAR)"
        
        base_query += " GROUP BY se.operator_id, se.submitted_at"

        # Count Total Data (for pagination)
        count_sql = f"SELECT COUNT(*) as total FROM ({base_query}) as sub"
        cursor.execute(count_sql, tuple(params))
        total_rows = cursor.fetchone()['total']
        total_pages = (total_rows + limit - 1) // limit
        
        # Sorting
        if sort == 'asc':
            base_query += " ORDER BY se.submitted_at ASC"
        else:
            base_query += " ORDER BY se.submitted_at DESC"
            
        # Pagination
        base_query += " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(base_query, tuple(params))
        data = cursor.fetchall()
        
        # Format date for frontend
        for row in data:
            # Format date and timestamp from the database results
            if isinstance(row['date'], (datetime, date)):
                # We store the raw date for frontend display and the full timestamp for API lookup
                dt_obj = row['date']
                row['date'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
                row['timestamp'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
                
        return {
            "data": data,
            "total": total_rows,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        logger.error(f"Error fetching auto-submit logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

@router.get("/admin/entries/detail-by-group")
def get_entries_detail_by_group(
    operator_id: int,
    submitted_at: str,
    user: dict = Depends(get_current_user)
):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Akses ditolak")
        
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Normalize submitted_at for robust comparison
        # Remove 'T' and microseconds if present
        clean_ts = submitted_at.replace('T', ' ').split('.')[0]
        
        sql = """
            SELECT se.*, u.nama as operator_name 
            FROM ship_entries se
            LEFT JOIN users u ON se.operator_id = u.id
            WHERE se.operator_id = %s
              AND se.submitted_at LIKE %s
              AND se.status IN ('SUBMITTED', 'APPROVED')
              AND (se.berat_ton > 0 OR se.jumlah_penumpang > 0 OR se.loa > 0 OR se.grt > 0)
        """
        
        # Using LIKE '2026-03-17 23:44:00%' will match even if DB has microseconds
        search_ts = f"{clean_ts}%"
        
        logger.info(f"Fetching detail for operator {operator_id} with pattern {search_ts}")
        cursor.execute(sql, (operator_id, search_ts))
        data = cursor.fetchall()
        
        # Use jsonable_encoder to handle all types (date, Decimal, etc.)
        return jsonable_encoder(data)
        
    except Exception as e:
        logger.error(f"Error in get_entries_detail_by_group: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

@router.post("/admin/seed-sample")
def api_seed_sample(
    user: dict = Depends(get_current_user),
    days: int = 90,
    min_entries: int = 10,
    max_entries: int = 15,
    reset_existing: bool = False
):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    try:
        end = date.today()
        start = end - timedelta(days=days)
        seed_sample_data(
            conn,
            num_operators=5,
            start_date=start,
            end_date=end,
            entries_per_operator_min=min_entries,
            entries_per_operator_max=max_entries,
            reset_existing=reset_existing,
            get_password_hash_func=get_password_hash
        )
        return {"message": "Seed sample berhasil dijalankan"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/admin/rekap-entries")
def get_rekap_entries(
    category: str, 
    start_date: str, 
    end_date: str, 
    user: dict = Depends(get_current_user)
):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Get Header Stats (Unit, GRT, LOA)
        # Modified: Use tanggal_laporan instead of tanggal_kedatangan
        
        header_sql = """
            SELECT 
                COUNT(*) as unit,
                COALESCE(SUM(grt), 0) as total_grt,
                COALESCE(SUM(loa), 0) as total_loa
            FROM ship_entries
            WHERE kategori_pelayaran = %s 
              AND tanggal_laporan BETWEEN %s AND %s
              AND status IN ('SUBMITTED', 'APPROVED')
              AND (berat_ton > 0 OR jumlah_penumpang > 0 OR loa > 0 OR grt > 0)
        """
        cursor.execute(header_sql, (category, start_date, end_date))
        header = cursor.fetchone()

        # 2. Get Cargo Breakdown (Bongkar / Inbound)
        bongkar_sql = """
            SELECT 
                SUM(berat_ton) as volume
            FROM ship_entries
            WHERE kategori_pelayaran = %s 
              AND tanggal_laporan BETWEEN %s AND %s
              AND jenis_kegiatan = 'Bongkar'
              AND status IN ('SUBMITTED', 'APPROVED')
              AND berat_ton > 0
        """
        cursor.execute(bongkar_sql, (category, start_date, end_date))
        bongkar_row = cursor.fetchone()
        
        bongkar_data = {}
        ton_total = float(bongkar_row['volume'] or 0)
        
        if ton_total > 0:
            bongkar_data["Barang"] = {"value": ton_total, "satuan": "Ton"}
            bongkar_data["TON dan MT"] = {"value": ton_total, "satuan": "Ton", "label": "Total (Ton)"}

        # 3. Get Cargo Breakdown (Muat / Outbound)
        muat_sql = """
            SELECT 
                SUM(berat_ton) as volume
            FROM ship_entries
            WHERE kategori_pelayaran = %s 
              AND tanggal_laporan BETWEEN %s AND %s
              AND jenis_kegiatan = 'Muat'
              AND status IN ('SUBMITTED', 'APPROVED')
              AND berat_ton > 0
        """
        cursor.execute(muat_sql, (category, start_date, end_date))
        muat_row = cursor.fetchone()
        
        muat_data = {}
        muat_ton_total = float(muat_row['volume'] or 0)
        
        if muat_ton_total > 0:
            muat_data["Barang"] = {"value": muat_ton_total, "satuan": "Ton"}
            muat_data["TON dan MT"] = {"value": muat_ton_total, "satuan": "Ton", "label": "Total (Ton)"}

        # 4. Get Passenger Stats (Penumpang)
        penumpang_sql = """
            SELECT 
                jenis_kegiatan,
                SUM(jumlah_penumpang) as total_pax
            FROM ship_entries
            WHERE kategori_pelayaran = %s 
              AND tanggal_laporan BETWEEN %s AND %s
              AND status IN ('SUBMITTED', 'APPROVED')
              AND jumlah_penumpang > 0
            GROUP BY jenis_kegiatan
        """
        try:
            cursor.execute(penumpang_sql, (category, start_date, end_date))
            pax_rows = cursor.fetchall()
        except Exception as e:
            logger.error(f"SQL error in get_rekap_entries (pax): {e}")
            pax_rows = []
        
        penumpang_data = {"turun": 0, "naik": 0}
        for r in pax_rows:
            # Add to bongkar/muat data so frontend finds it at getVal("bongkar", "Penumpang")
            key = "Penumpang"
            val = float(r['total_pax'])
            if r['jenis_kegiatan'] == 'Bongkar':
                penumpang_data['turun'] = val
                bongkar_data[key] = {"value": val, "satuan": "Orang"}
            elif r['jenis_kegiatan'] == 'Muat':
                penumpang_data['naik'] = val
                muat_data[key] = {"value": val, "satuan": "Orang"}

        # 5. Get Container Stats (Simplified/Removed as per frontend cleanup)
        container_stats = {
            "Bongkar": {
                "Isi": {"20_box": 0, "40_box": 0, "20_ton": 0, "40_ton": 0},
                "Kosong": {"20_box": 0, "40_box": 0}
            },
            "Muat": {
                "Isi": {"20_box": 0, "40_box": 0, "20_ton": 0, "40_ton": 0},
                "Kosong": {"20_box": 0, "40_box": 0}
            }
        }
        
        return {
            "header": {
                "unit": header['unit'],
                "total_grt": float(header['total_grt']),
                "total_loa": float(header['total_loa'])
            },
            "bongkar": bongkar_data,
            "muat": muat_data,
            "penumpang": penumpang_data,
            "container_stats": container_stats
        }
        
    finally:
        cursor.close()
        conn.close()

@router.get("/admin/dashboard-summary")
def get_admin_dashboard_summary(
    bulan: int, 
    tahun: int, 
    trend_type: str = 'Bongkar',
    user: dict = Depends(get_current_user)
):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database error")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Global Stats (Filtered by Month & Year ONLY)
        # Simplified: Show TOTAL for all activities regardless of trend_type filter
        global_sql = """
            SELECT 
                COUNT(*) as total_unit
            FROM ship_entries 
            WHERE MONTH(tanggal_laporan) = %s
              AND YEAR(tanggal_laporan) = %s
              AND status IN ('SUBMITTED', 'APPROVED')
        """
        cursor.execute(global_sql, (bulan, tahun))
        global_stats = cursor.fetchone()

        # 2. Total Submitted (Laporan Masuk)
        # Simplified: Show TOTAL submitted regardless of activity type
        submitted_sql = """
            SELECT COUNT(*) as total_submitted
            FROM ship_entries 
            WHERE MONTH(tanggal_laporan) = %s
              AND YEAR(tanggal_laporan) = %s
              AND status IN ('SUBMITTED', 'APPROVED')
        """
        cursor.execute(submitted_sql, (bulan, tahun))
        submitted_stats = cursor.fetchone()
            
        return {
            "summary": {
                "totalUnitGlobal": global_stats['total_unit'],
                "totalSubmitted": submitted_stats['total_submitted']
            }
        }
        
    finally:
        cursor.close()
        conn.close()
