from app.core.database import get_db_connection
from app.core.security import get_password_hash
import sys
import os

# Add current directory to sys.path to ensure app module is found
sys.path.append(os.getcwd())

def main():
    print("Connecting to database...")
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database.")
        return

    print("Cleaning operational data (Entries & Logs)...")
    try:
        cursor = conn.cursor()
        
        # 1. Clear Operational Data Only
        # We keep the 'users' table intact, but clear entries and logs
        cursor.execute("DELETE FROM ship_entries")
        cursor.execute("DELETE FROM auto_submit_logs")
        conn.commit()
        print("All ship entries and logs deleted.")

        # 2. Ensure Admin User Exists
        cursor.execute("SELECT * FROM users WHERE role='ADMIN' LIMIT 1")
        admin = cursor.fetchone()
        if not admin:
            print("Creating default admin user...")
            pwd_hash = get_password_hash("password123")
            cursor.execute(
                "INSERT INTO users (nama, email, role, password_hash) VALUES (%s, %s, %s, %s)",
                ("Administrator", "admin@example.com", "ADMIN", pwd_hash)
            )
            conn.commit()
            print("Admin user created: admin@example.com / password123")
        else:
            print("Admin user check: OK.")

        # 3. Ensure Default Operator Exists
        cursor.execute("SELECT * FROM users WHERE role='OPERATOR' LIMIT 1")
        operator = cursor.fetchone()
        if not operator:
             print("Creating default operator user...")
             pwd_hash = get_password_hash("password123")
             cursor.execute(
                "INSERT INTO users (nama, email, role, password_hash) VALUES (%s, %s, %s, %s)",
                ("Andi Pratama", "andi@example.com", "OPERATOR", pwd_hash)
             )
             conn.commit()
             print("Operator user created: andi@example.com / password123")
        else:
             print("Operator user check: OK.")

        cursor.close()
        print("------------------------------------------------")
        print("Seeder Finished: Data cleared, Accounts secured.")
        print("------------------------------------------------")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    main()
