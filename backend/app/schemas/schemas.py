
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, List
from datetime import date, datetime

class UserLogin(BaseModel):
    email: str
    password: str

class UserInfo(BaseModel):
    id: int
    nama: str
    email: Optional[str] = None
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo

class ShipEntry(BaseModel):
    kategori_pelayaran: Literal["Luar Negeri", "Dalam Negeri", "Perintis", "Rakyat"]
    loa: float
    grt: float
    jenis_kegiatan: Optional[Literal["Bongkar", "Muat"]] = None
    activity: Optional[Literal["Bongkar", "Muat"]] = None # Frontend sends 'activity'
    
    # Cargo Details (Input Mapping)
    komoditas: Optional[str] = None
    commodity: Optional[str] = None # Frontend sends 'commodity'
    description: Optional[str] = None # Frontend sends 'description'
    amount: Optional[float] = 0 # Frontend sends 'amount'
    unit: Optional[str] = None # Frontend sends 'unit'
    
    # Legacy Fields (Calculated/Mapped)
    berat_ton: float = Field(default=0)
    jumlah_penumpang: int = Field(default=0)
    
    tanggal_laporan: Optional[date] = None
    operator_id: Optional[int] = None
    
    # Metadata Submission (Optional in response)
    submitted_at: Optional[datetime] = None
    submit_method: Optional[Literal["MANUAL", "AUTO"]] = "MANUAL"

class EntryUpdate(BaseModel):
    loa: Optional[float] = None
    grt: Optional[float] = None
    jenis_kegiatan: Optional[str] = None
    berat_ton: Optional[float] = None
    jumlah_penumpang: Optional[int] = None
    komoditas: Optional[str] = None

class SubmitRequest(BaseModel):
    operator_id: Optional[int] = None
    bulan: int
    tahun: int

class UserCreate(BaseModel):
    nama: str
    email: str
    password: str
