
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import bcrypt_fix # Apply fix before other imports
from app.routers import auth, entries, operators, admin, dashboard
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LOGGING CONFIG
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = FastAPI(title="Web Entries API", version="1.0.0")

# CORS CONFIG
# Allowed origins — loaded from environment
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    os.getenv("FRONTEND_URL_PROD", ""),
    "http://localhost:3000",   # fallback for development
    "http://127.0.0.1:5173",
]

# Remove empty strings from the list
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
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
