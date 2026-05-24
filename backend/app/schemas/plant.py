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

class PlantResponse(PlantBase):
    id: str
    seller_id: str
    created_at: datetime

    class Config:
        from_attributes = True
