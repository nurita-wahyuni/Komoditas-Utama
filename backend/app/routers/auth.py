
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from app.core.security import verify_password, create_access_token, get_current_user
from app.core.database import get_db_connection
from app.schemas.schemas import Token, UserLogin
import mysql.connector

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database tidak terhubung")
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.email,))
        user = cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau password salah",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(
            data={"sub": str(user['id']), "role": user['role']}
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": user['id'],
                "nama": user['nama'],
                "email": user['email'],
                "role": user['role']
            }
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
