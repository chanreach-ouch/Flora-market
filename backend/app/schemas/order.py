from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    plant_id: str
    quantity: int


class OrderCreate(BaseModel):
    seller_id: str
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: str
    plant_id: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    buyer_id: str
    seller_id: str
    total_amount: float
    status: OrderStatus
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
