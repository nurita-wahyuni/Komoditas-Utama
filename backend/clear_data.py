from app.core.database import get_db_connection

def clear_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Disable foreign key checks to avoid constraint errors
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        print("Menghapus data ship_entries...")
        cursor.execute("TRUNCATE TABLE ship_entries")
        
        print("Menghapus data auto_submit_logs...")
        cursor.execute("TRUNCATE TABLE auto_submit_logs")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        conn.commit()
        print("Semua data transaksi berhasil dihapus (User tetap aman).")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    clear_data()
