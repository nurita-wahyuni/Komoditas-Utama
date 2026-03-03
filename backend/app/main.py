
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import bcrypt_fix # Apply fix before other imports
from app.routers import auth, entries, operators, admin, dashboard
import os
from app.core.config import settings
import logging

# LOGGING CONFIG
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = FastAPI(title="Web Entries API", version="1.0.0")

# CORS CONFIG
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE ROUTERS
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(entries.router, prefix="/api", tags=["Entries"])
app.include_router(operators.router, prefix="/api", tags=["Operators"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Backend entries-project berjalan lancar (Refactored)!"}
