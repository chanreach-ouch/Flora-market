from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    plant_id: str
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: str
    order_id: str
    unit_price: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    seller_id: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderResponse(OrderBase):
    id: str
    buyer_id: str
    total_amount: float
    status: OrderStatus
    items: List[OrderItemResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True