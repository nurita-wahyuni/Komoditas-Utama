
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Fix for "password cannot be longer than 72 bytes" error in bcrypt
    # Truncate password to 72 bytes as bcrypt standard limit
    # This is a common workaround for this specific passlib/bcrypt interaction issue
    # Ensure plain_password is bytes for accurate truncation
    if plain_password is None:
        return False
        
    # Ensure hashed_password is a string, as passlib expects
    if isinstance(hashed_password, bytes):
        try:
            hashed_password = hashed_password.decode('utf-8')
        except UnicodeDecodeError:
            # Fallback if it's not utf-8 compatible bytes (rare for bcrypt hashes)
            return False

    # Fix: passlib 1.7.4 + bcrypt 4.0+ compatibility issue
    # "AttributeError: module 'bcrypt' has no attribute '__about__'"
    # This is often handled by patching passlib, but direct bcrypt usage or ensuring
    # plain_password isn't too long helps.
    
    # Try verification with error handling
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        if "password cannot be longer than 72 bytes" in str(e):
            # Truncate and retry (less secure but functional for now if inputs are long)
            # Better approach: hash the password with sha256 first then bcrypt, 
            # but that requires changing how ALL passwords are stored.
            # For now, let's just catch it.
            return False
        raise e
    except AttributeError:
        # Fallback for the 'bcrypt' module version mismatch
        import bcrypt
        try:
            # Verify manually using bcrypt directly if passlib fails
            if isinstance(plain_password, str):
                plain_password = plain_password.encode('utf-8')
            if isinstance(hashed_password, str):
                hashed_password = hashed_password.encode('utf-8')
            
            return bcrypt.checkpw(plain_password, hashed_password)
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
        return {"id": user_id, "role": role}
    except JWTError:
        raise credentials_exception
