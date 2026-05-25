from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: float
    comment: Optional[str] = None
    comment_kh: Optional[str] = None

class ReviewCreate(ReviewBase):
    plant_id: str
    seller_id: str

class ReviewResponse(ReviewBase):
    id: str
    buyer_id: str
    seller_id: str
    plant_id: str
    created_at: datetime

    class Config:
        from_attributes = True