
from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.database import get_db_connection
from app.core.security import get_current_user, get_password_hash
from app.schemas.schemas import UserCreate
from typing import List

router = APIRouter()

@router.get("/operators")
def get_operators(user: dict = Depends(get_current_user)):
    # SECURITY CHECK
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Hanya admin yang dapat melihat list operator")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, nama, role, email, created_at FROM users WHERE role = 'OPERATOR'")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/operators")
def create_operator(operator: UserCreate, user: dict = Depends(get_current_user)):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check email unique
        cursor.execute("SELECT id FROM users WHERE email = %s", (operator.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
            
        pwd_hash = get_password_hash(operator.password)
        
        cursor.execute(
            "INSERT INTO users (nama, email, password_hash, role) VALUES (%s, %s, %s, 'OPERATOR')",
            (operator.nama, operator.email, pwd_hash)
        )
        conn.commit()
        return {"message": "Operator created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.put("/operators/{id}")
def update_operator(id: int, data: dict = Body(...), user: dict = Depends(get_current_user)):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        # Dynamic update based on provided fields
        update_fields = []
        params = []
        
        if 'nama' in data:
            update_fields.append("nama = %s")
            params.append(data['nama'])
        if 'email' in data:
            update_fields.append("email = %s")
            params.append(data['email'])
        if 'password' in data and data['password']:
            update_fields.append("password_hash = %s")
            params.append(get_password_hash(data['password']))
            
        if not update_fields:
            return {"message": "No fields to update"}
            
        params.append(id)
        sql = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(sql, tuple(params))
        conn.commit()
        
        return {"message": "Operator updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.delete("/operators/{id}")
def delete_operator(id: int, user: dict = Depends(get_current_user)):
    if user['role'] != 'ADMIN':
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        conn.commit()
        
        return {"message": "Operator deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
