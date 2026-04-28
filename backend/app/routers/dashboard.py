
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.core.database import get_db_connection

router = APIRouter()

@router.get("/dashboard/trend")
def get_dashboard_trend(tahun: int, jenis_trend: str):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        target_commodities = ["LPG", "LNG", "PUPUK", "AMMONIA", "AMMONIUM NITRATE"]
        
        sql = """
            SELECT 
                MONTH(tanggal_laporan) as bulan,
                jenis_kegiatan,
                SUM(berat_ton) as volume
            FROM ship_entries
            WHERE YEAR(tanggal_laporan) = %s
              AND status IN ('SUBMITTED', 'APPROVED')
        """
        
        params = [tahun]
        
        if jenis_trend == 'Luar Negeri':
            sql += " AND kategori_pelayaran = 'Luar Negeri'"
        elif jenis_trend == 'Dalam Negeri':
            sql += " AND kategori_pelayaran IN ('Dalam Negeri', 'Perintis', 'Rakyat')"
            
        sql += " GROUP BY MONTH(tanggal_laporan), jenis_kegiatan"
        
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        
        # 2. Since we removed specific commodities, we just use a 'Total' series or similar
        # But to keep frontend compatibility if it expects the 5 commodities:
        unique_cargos = target_commodities

        # 3. Inisialisasi struktur data Jan-Des
        months_names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        
        bongkar_data = []
        muat_data = []

        for i in range(1, 13):
            # Init Bongkar
            b_obj = {"name": months_names[i-1], "bulan_index": i}
            for cargo in unique_cargos: b_obj[cargo] = 0
            
            # Init Muat
            m_obj = {"name": months_names[i-1], "bulan_index": i}
            for cargo in unique_cargos: m_obj[cargo] = 0

            # Fill Bongkar (Assign total volume to first commodity for now, or split if logic exists)
            # This is a fallback to keep the chart showing something if it expects these keys.
            b_rows = [r for r in rows if r['bulan'] == i and r['jenis_kegiatan'] == 'Bongkar']
            for r in b_rows:
                # Assign to 'LPG' as a placeholder or use a generic 'Total' if frontend updated
                b_obj['LPG'] = float(r['volume'])
            
            # Fill Muat
            m_rows = [r for r in rows if r['bulan'] == i and r['jenis_kegiatan'] == 'Muat']
            for r in m_rows:
                m_obj['LPG'] = float(r['volume'])
            
            bongkar_data.append(b_obj)
            muat_data.append(m_obj)
        
        return {
            "series": unique_cargos,
            "bongkar": bongkar_data,
            "muat": muat_data,
            "data": bongkar_data # Fallback for old callers who expect "data"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/summary/tahunan")
def get_summary_tahunan(tahun: int, operator_id: Optional[int] = None):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Get total unit and LOA for the year per operator
        params = [tahun]
        op_filter = ""
        if operator_id:
            op_filter = "AND operator_id = %s"
            params.append(operator_id)
            
        query = f"""
        SELECT 
            operator_id,
            COUNT(*) as total_unit,
            COALESCE(SUM(loa), 0) as total_loa
        FROM ship_entries
        WHERE YEAR(tanggal_laporan) = %s {op_filter}
        GROUP BY operator_id
        """
        cursor.execute(query, tuple(params))
        data = cursor.fetchall()
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/dashboard/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Hitung Total Hari Ini
        sql = """
            SELECT 
                COUNT(*) as total_unit,
                COALESCE(SUM(loa), 0) as total_loa
            FROM ship_entries
            WHERE DATE(tanggal_laporan) = CURDATE()
        """
        cursor.execute(sql)
        today = cursor.fetchone()
        
        # Hitung Total Keseluruhan
        cursor.execute("SELECT COUNT(*) as all_time FROM ship_entries")
        all_time = cursor.fetchone()
        
        return {
            "today_unit": today['total_unit'],
            "today_loa": today['total_loa'],
            "all_time_unit": all_time['all_time']
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/dashboard/distribution")
def get_commodity_distribution(tahun: int, operator_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Query for monthly commodity volume
        query = """
        SELECT 
            komoditas AS barang, 
            MONTH(tanggal_laporan) AS bulan,
            SUM(jumlah_muatan) AS volume 
        FROM ship_entries 
        WHERE YEAR(tanggal_laporan) = %s 
        AND operator_id = %s 
        AND status = 'SUBMITTED' 
        GROUP BY komoditas, MONTH(tanggal_laporan)
        ORDER BY bulan ASC
        """
        cursor.execute(query, (tahun, operator_id))
        rows = cursor.fetchall()
        
        # 1. Extract unique Commodity types (Series)
        unique_cargos = sorted(list(set(r['barang'] for r in rows if r['barang'])))

        # 2. Initialize Jan-Dec structure
        months_names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        
        result = []
        for i in range(1, 13):
            month_obj = {
                "name": months_names[i-1],
                "bulan_index": i
            }
            # Initialize all cargos to 0
            for cargo in unique_cargos:
                month_obj[cargo] = 0

            # Fill with actual data
            month_rows = [r for r in rows if r['bulan'] == i]
            for r in month_rows:
                if r['barang']:
                    month_obj[r['barang']] = float(r['volume'] or 0)
            
            result.append(month_obj)
        
        return {
            "series": unique_cargos,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
