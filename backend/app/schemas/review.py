from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    seller_id: str
    plant_id: str
    rating: float
    comment: Optional[str] = None
    comment_kh: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    buyer_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True