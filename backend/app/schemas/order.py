from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    plant_id: str
    quantity: int
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: str
    order_id: str

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    status: OrderStatus = OrderStatus.pending

class OrderCreate(BaseModel):
    seller_id: str
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: OrderStatus

class OrderResponse(OrderBase):
    id: str
    buyer_id: str
    seller_id: str
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True