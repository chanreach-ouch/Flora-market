from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    plant_id: str
    seller_id: str
    rating: float
    comment: Optional[str] = None
    comment_kh: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    buyer_id: str
    seller_id: str
    plant_id: str
    rating: float
    comment: Optional[str] = None
    comment_kh: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
