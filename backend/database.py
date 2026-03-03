import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='db_entries',
            user='root',
            password='' 
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("Koneksi ke db_entries berhasil!")
        conn.close()
    else:
        print("Gagal terhubung ke database. Pastikan XAMPP/MySQL aktif.")