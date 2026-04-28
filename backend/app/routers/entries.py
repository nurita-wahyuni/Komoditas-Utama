
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from datetime import datetime, date
from app.core.database import get_db_connection
from app.core.security import get_current_user
from app.schemas.schemas import ShipEntry, EntryUpdate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# --- HELPERS ---

# REMOVED: is_batch argument — parameter defined but never used
def process_entry_data(entry: ShipEntry, operator_id: int) -> dict:
    """
    Shared processing logic for single and batch entry submission.
    Handles field validation, mapping, and data formatting.
    """
    # 1. Map Frontend fields to Database fields
    loa = float(entry.loa or 0)
    grt = float(entry.grt or 0)
    
    # Priority for 'jenis_kegiatan' then 'activity'
    jenis_kegiatan = entry.jenis_kegiatan or entry.activity
    
    # Priority for 'komoditas' then 'commodity'
    komoditas = entry.komoditas or entry.commodity
    
    # Priority for 'jumlah_muatan' then 'amount'
    amount = float(entry.amount or 0)
    
    # Priority for 'satuan_muatan' then 'unit'
    unit = entry.unit
    
    # Check if row has any significant data
    has_data = any([
        loa != 0,
        grt != 0,
        amount != 0,
        bool(jenis_kegiatan)
    ])
    
    if not has_data:
        return None

    # 2. Legacy Field Mapping
    # Logic: if commodity/unit implies passengers, put in jumlah_penumpang
    # Else put in berat_ton
    berat_ton = float(entry.berat_ton or 0)
    jumlah_penumpang = int(entry.jumlah_penumpang or 0)
    
    if amount > 0:
        if unit in ["Orang", "Penumpang"]:
            jumlah_penumpang = int(amount)
        elif unit in ["Ton", "MT", "KL"]:
            berat_ton = amount

    # 3. Prepare Processed Dictionary
    return {
        "operator_id": operator_id,
        "kategori_pelayaran": entry.kategori_pelayaran,
        "loa": loa,
        "grt": grt,
        "jenis_kegiatan": jenis_kegiatan,
        "komoditas": komoditas,
        "tanggal_laporan": entry.tanggal_laporan or date.today(),
        "berat_ton": berat_ton,
        "jumlah_penumpang": jumlah_penumpang,
        "status": "SUBMITTED",
        "submit_method": "MANUAL"
    }

# --- OPERATOR ENDPOINTS ---

@router.get("/entries")
def get_all_entries(
    operator_id: Optional[str] = None, 
    year: Optional[int] = None,
    month: Optional[int] = None,
    status: Optional[str] = None,
    grouped: Optional[bool] = False,
    user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
        
    cursor = conn.cursor(dictionary=True)
    try:
        # If OPERATOR, force their own ID
        if user['role'] == 'OPERATOR':
            operator_id = str(user['id'])

        if grouped:
            # Logic for grouped view (similar to admin auto-submit logs)
            sql = """
                SELECT 
                    MIN(se.id) as id,
                    se.submitted_at as timestamp,
                    se.submitted_at as date,
                    se.operator_id,
                    u.nama as operator_name,
                    COUNT(*) as total_entries,
                    GROUP_CONCAT(DISTINCT se.jenis_kegiatan SEPARATOR ', ') as activities,
                    GROUP_CONCAT(DISTINCT se.kategori_pelayaran SEPARATOR ', ') as categories,
                    se.status
                FROM ship_entries se
                JOIN users u ON se.operator_id = u.id
                WHERE se.status IN ('SUBMITTED', 'APPROVED')
                  AND se.submitted_at IS NOT NULL
                  AND (se.berat_ton > 0 OR se.jumlah_penumpang > 0 OR se.loa > 0 OR se.grt > 0)
            """
            params = []
            if operator_id and operator_id.lower() != 'undefined':
                sql += " AND se.operator_id = %s"
                params.append(operator_id)
            
            sql += " GROUP BY se.operator_id, se.submitted_at, se.status ORDER BY se.submitted_at DESC"
            cursor.execute(sql, tuple(params))
            data = cursor.fetchall()
            
            # Format dates
            for row in data:
                if isinstance(row['date'], (datetime, date)):
                    dt_obj = row['date']
                    row['date'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
                    row['timestamp'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
            return data

        # Original logic for non-grouped view
        conditions = []
        params = []
        
        if operator_id and operator_id.lower() != 'undefined':
            conditions.append("operator_id = %s")
            params.append(operator_id)
            
        if year is not None:
            conditions.append("YEAR(tanggal_laporan) = %s")
            params.append(year)
            
        if month is not None:
            conditions.append("MONTH(tanggal_laporan) = %s")
            params.append(month)
            
        if status is not None and status.lower() != 'undefined':
            if ',' in status:
                statuses = status.split(',')
                placeholders = ', '.join(['%s'] * len(statuses))
                conditions.append(f"status IN ({placeholders})")
                params.extend(statuses)
            else:
                conditions.append("status = %s")
                params.append(status)

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)
            
        sql = f"SELECT * FROM ship_entries {where_clause} ORDER BY tanggal_laporan DESC, id DESC"
        cursor.execute(sql, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@router.post("/entries/report")
def submit_batch_entries(
    payload: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "OPERATOR":
        raise HTTPException(status_code=403, detail="Hanya operator yang dapat melakukan submit")

    CATEGORY_MAP = {
        "luar_negeri": "Luar Negeri",
        "dalam_negeri": "Dalam Negeri",
        "perintis": "Perintis",
        "rakyat": "Rakyat",
    }

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")

    cursor = conn.cursor()
    batch_timestamp = datetime.now()
    
    insert_sql = """
        INSERT INTO ship_entries (
            operator_id, kategori_pelayaran, loa, grt, jenis_kegiatan,
            tanggal_laporan, status, submitted_at, submit_method,
            berat_ton, jumlah_penumpang, komoditas
        )
        VALUES (%s, %s, %s, %s, %s, CURDATE(), %s, %s, %s, %s, %s, %s)
    """

    total_rows = 0
    try:
        for cat_key, rows in (payload or {}).items():
            kategori = CATEGORY_MAP.get(cat_key)
            if not kategori or not isinstance(rows, list):
                continue
                
            for row_dict in rows:
                # Convert dict to ShipEntry for processing (partial validation)
                try:
                    # Mock a date since it's not in the batch row but required by schema
                    row_dict["kategori_pelayaran"] = kategori
                    
                    entry_obj = ShipEntry(**row_dict)
                    data = process_entry_data(entry_obj, user["id"])
                    
                    if not data:
                        continue

                    values = (
                        data["operator_id"], data["kategori_pelayaran"], data["loa"], data["grt"], data["jenis_kegiatan"],
                        data["status"], batch_timestamp, data["submit_method"],
                        data["berat_ton"], data["jumlah_penumpang"],
                        data["komoditas"]
                    )
                    cursor.execute(insert_sql, values)
                    total_rows += 1
                except Exception:
                    continue # Skip invalid rows in batch

        conn.commit()
        return {"message": "Entries submitted successfully", "rows_inserted": total_rows}
    except Exception as e:
        conn.rollback()
        logger.exception("Error submitting batch entries")
        raise HTTPException(status_code=500, detail="Gagal menyimpan data") from e
    finally:
        cursor.close()
        conn.close()

@router.get("/entries/{entry_id}")
def get_entry_detail(
    entry_id: str, 
    by_timestamp: bool = False,
    operator_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
        
    cursor = conn.cursor(dictionary=True)
    try:
        if by_timestamp:
            # Fetch all entries for that timestamp group
            # If operator, ensure they only see their own
            if user['role'] == 'OPERATOR':
                operator_id = str(user['id'])
                
            sql = """
                SELECT se.*, u.nama as operator_name 
                FROM ship_entries se
                JOIN users u ON se.operator_id = u.id
                WHERE se.submitted_at = %s
            """
            params = [entry_id] # entry_id is the timestamp string
            
            if operator_id:
                sql += " AND se.operator_id = %s"
                params.append(operator_id)
                
            sql += " AND (se.berat_ton > 0 OR se.jumlah_penumpang > 0 OR se.loa > 0 OR se.grt > 0)"
            cursor.execute(sql, tuple(params))
            entries = cursor.fetchall()
            
            if not entries:
                raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
                
            # Return as a structured report
            return {
                "timestamp": entry_id,
                "operator_name": entries[0]['operator_name'],
                "status": entries[0]['status'],
                "entries": entries
            }
        else:
            # Original single entry logic
            sql = "SELECT se.*, u.nama as operator_name FROM ship_entries se JOIN users u ON se.operator_id = u.id WHERE se.id = %s"
            cursor.execute(sql, (entry_id,))
            entry = cursor.fetchone()
            if not entry:
                raise HTTPException(status_code=404, detail="Entri tidak ditemukan")
            return entry
    finally:
        cursor.close()
        conn.close()

@router.post("/entri")
def save_entries(entry: ShipEntry, user: dict = Depends(get_current_user)):
    # SECURITY CHECK
    if user['role'] != 'OPERATOR':
        raise HTTPException(status_code=403, detail="Hanya operator yang dapat melakukan entri")
        
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor()
    try:
        data = process_entry_data(entry, user['id'], is_batch=False)
        if not data:
            raise HTTPException(status_code=400, detail="Data entri tidak lengkap")

        sql = """INSERT INTO ship_entries (
            operator_id, kategori_pelayaran, loa, grt, jenis_kegiatan,
            tanggal_laporan, status, submitted_at, submit_method,
            berat_ton, jumlah_penumpang, komoditas
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s)"""
        
        values = (
            data["operator_id"], data["kategori_pelayaran"], data["loa"], data["grt"], data["jenis_kegiatan"],
            data["tanggal_laporan"], data["status"], data["submit_method"],
            data["berat_ton"], data["jumlah_penumpang"],
            data["komoditas"]
        )
        
        cursor.execute(sql, values)
        conn.commit()
        
        return {"message": "Data berhasil disimpan"}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/entri/{id}")
def update_entry(id: int, entry: ShipEntry, user: dict = Depends(get_current_user)):
    # SECURITY CHECK
    if user['role'] != 'OPERATOR':
        raise HTTPException(status_code=403, detail="Hanya operator yang dapat melakukan update")
        
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Cek Data Existing (Status & Ownership)
        cursor.execute("SELECT operator_id, status FROM ship_entries WHERE id = %s", (id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
        # Validasi Ownership (Operator ID harus sama dengan user login)
        if existing['operator_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Anda tidak memiliki akses untuk mengedit data ini")
            
        # Validasi Status (Boleh edit jika SUBMITTED atau DRAFT, tapi tidak APPROVED)
        if existing['status'] == 'APPROVED':
            raise HTTPException(status_code=400, detail="Data sudah disetujui (APPROVED) dan tidak bisa diedit")
            
        # 2. Update Data
        # Process entry using helper
        data = process_entry_data(entry, user['id'])
        if not data:
             raise HTTPException(status_code=400, detail="Data update tidak valid")

        sql = """UPDATE ship_entries SET
            kategori_pelayaran = %s,
            loa = %s,
            grt = %s,
            jenis_kegiatan = %s,
            berat_ton = %s,
            jumlah_penumpang = %s,
            tanggal_laporan = %s,
            komoditas = %s
            WHERE id = %s
        """
        
        values = (
            data["kategori_pelayaran"], data["loa"], data["grt"],
            data["jenis_kegiatan"], data["berat_ton"], data["jumlah_penumpang"],
            data["tanggal_laporan"], data["komoditas"],
            id
        )
        
        cursor.execute(sql, values)
        conn.commit()
        
        return {"message": "Data berhasil diperbarui"}
        
    except HTTPException as http_ex:
        conn.rollback()
        raise http_ex
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.delete("/entri/{id}")
def delete_entry(id: int, user: dict = Depends(get_current_user)):
    # SECURITY CHECK
    if user['role'] != 'OPERATOR':
        raise HTTPException(status_code=403, detail="Hanya operator yang dapat menghapus data")
        
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Cek Data Existing
        cursor.execute("SELECT operator_id, status FROM ship_entries WHERE id = %s", (id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
            
        # Validasi Ownership
        if existing['operator_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Anda tidak memiliki akses untuk menghapus data ini")
            
        # Validasi Status (Boleh hapus jika SUBMITTED atau DRAFT)
        if existing['status'] == 'APPROVED':
            raise HTTPException(status_code=400, detail="Data sudah disetujui (APPROVED) dan tidak bisa dihapus")
            
        cursor.execute("DELETE FROM ship_entries WHERE id = %s", (id,))
        conn.commit()
        
        return {"message": "Data berhasil dihapus"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/entries/manual-submit")
async def manual_submit_entries(
    payload: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    if user['role'] != 'OPERATOR':
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    target_ids = payload.get("entry_ids") 
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        now = datetime.now()
        
        if target_ids:
            # Submit specific IDs (if provided)
            format_strings = ','.join(['%s'] * len(target_ids))
            sql = f"""
                UPDATE ship_entries
                SET status = 'SUBMITTED',
                    submitted_at = %s,
                    submit_method = 'MANUAL'
                WHERE id IN ({format_strings})
                  AND operator_id = %s
            """
            params = [now] + target_ids + [user['id']]
            cursor.execute(sql, tuple(params))
            rows = cursor.rowcount
            
        else:
             raise HTTPException(status_code=400, detail="Invalid submit request")

        conn.commit()
        return {"message": f"Berhasil mensubmit {rows} data secara manual.", "rows": rows}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# --- ADMIN ENTRY ENDPOINTS ---

@router.put("/admin/entries/{entry_id}")
def update_entry_admin(entry_id: int, entry: EntryUpdate, user: dict = Depends(get_current_user)):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check existence
        cursor.execute("SELECT id FROM ship_entries WHERE id = %s", (entry_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Entry not found")
            
        # Build update query dynamically
        update_fields = []
        params = []
        
        # entry.dict(exclude_unset=True) is deprecated in Pydantic v2, use model_dump
        # But we need to check if user has pydantic v2 or v1.
        # Requirements didn't specify version. Assuming v2.
        # But to be safe with v1/v2 compatibility:
        entry_data = entry.model_dump(exclude_unset=True) if hasattr(entry, 'model_dump') else entry.dict(exclude_unset=True)

        for field, value in entry_data.items():
            update_fields.append(f"{field} = %s")
            params.append(value)
            
        if not update_fields:
            return {"message": "No fields to update"}
            
        params.append(entry_id)
        sql = f"UPDATE ship_entries SET {', '.join(update_fields)} WHERE id = %s"
        
        cursor.execute(sql, tuple(params))
        conn.commit()
        
        return {"message": "Entry updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.delete("/admin/entries/{id}")
def delete_entry_admin(id: int, user: dict = Depends(get_current_user)):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM ship_entries WHERE id = %s", (id,))
        conn.commit()
        return {"message": "Entry deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/entri/draft-count")
def get_my_draft_count(operator_id: Optional[int] = None, user: dict = Depends(get_current_user)):
    # SECURITY LOGIC
    target_operator_id = operator_id
    if user['role'] == 'OPERATOR':
        target_operator_id = user['id'] # Force own ID
        
    if target_operator_id is None:
        raise HTTPException(status_code=400, detail="Operator ID required")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT COUNT(*) as draft_count 
        FROM ship_entries 
        WHERE operator_id = %s AND status = 'DRAFT'
        """
        cursor.execute(query, (target_operator_id,))
        result = cursor.fetchone()
        
        return result 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
