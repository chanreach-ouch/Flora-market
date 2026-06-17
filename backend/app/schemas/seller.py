from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SellerBase(BaseModel):
    nursery_name: str
    nursery_name_kh: Optional[str] = None
    description: Optional[str] = None
    description_kh: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    specialties: Optional[List[str]] = []
    specialties_kh: Optional[List[str]] = []


class SellerCreate(SellerBase):
    pass


class SellerUpdate(BaseModel):
    nursery_name: Optional[str] = None
    nursery_name_kh: Optional[str] = None
    description: Optional[str] = None
    description_kh: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    cover_photo: Optional[str] = None
    avatar: Optional[str] = None
    specialties: Optional[List[str]] = None
    specialties_kh: Optional[List[str]] = None
    year_joined: Optional[int] = None


class SellerResponse(SellerBase):
    id: str
    user_id: str
    cover_photo: Optional[str] = None
    avatar: Optional[str] = None
    is_verified: bool
    is_suspended: bool = False
    rating: float
    total_orders: int
    total_plants: int
    year_joined: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
