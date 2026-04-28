import mysql.connector
from mysql.connector import Error

def create_database():
    conn = None
    try:
        # Connect to MySQL Server (no database selected)
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=''
        )
        if conn.is_connected():
            cursor = conn.cursor()
            
            # Read schema.sql
            with open('../database/schema.sql', 'r') as f:
                schema_sql = f.read()
            
            # Reset Database
            try:
                cursor.execute("DROP DATABASE IF EXISTS db_entries")
                print("Dropped existing database.")
            except Error as e:
                print(f"Error dropping database: {e}")

            # Split by ';'
            statements = schema_sql.split(';')
            
            for statement in statements:
                if statement.strip():
                    try:
                        cursor.execute(statement)
                        # Consume result if any (to avoid "Unread result found")
                        while cursor.nextset():
                            pass
                    except Error as e:
                        print(f"Error executing statement: {statement[:50]}... \nError: {e}")
            
            conn.commit()
            print("Database setup completed successfully.")
            
    except Error as e:
        print(f"Connection Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    create_database()
