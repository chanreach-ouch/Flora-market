from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PlantBase(BaseModel):
    name_en: str
    name_kh: str
    category: str
    price: float
    stock: int
    tagline: Optional[str] = None
    tagline_kh: Optional[str] = None
    images: Optional[List[str]] = []
    pros: Optional[List[str]] = []
    pros_kh: Optional[List[str]] = []
    cons: Optional[List[str]] = []
    cons_kh: Optional[List[str]] = []
    water_freq: Optional[str] = None
    water_freq_kh: Optional[str] = None
    light_req: Optional[str] = None
    light_req_kh: Optional[str] = None
    temp_range: Optional[str] = None
    difficulty: Optional[str] = None
    difficulty_kh: Optional[str] = None
    is_new: bool = True
    is_active: bool = True

class PlantCreate(PlantBase):
    pass

class PlantUpdate(BaseModel):
    name_en: Optional[str] = None
    name_kh: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    tagline: Optional[str] = None
    tagline_kh: Optional[str] = None
    images: Optional[List[str]] = None
    pros: Optional[List[str]] = None
    pros_kh: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    cons_kh: Optional[List[str]] = None
    water_freq: Optional[str] = None
    water_freq_kh: Optional[str] = None
    light_req: Optional[str] = None
    light_req_kh: Optional[str] = None
    temp_range: Optional[str] = None
    difficulty: Optional[str] = None
    difficulty_kh: Optional[str] = None
    is_active: Optional[bool] = None

class PlantResponse(PlantBase):
    id: str
    seller_id: str
    created_at: datetime

    class Config:
        from_attributes = True
