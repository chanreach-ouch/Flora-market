from sqlalchemy import String, Float, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import enum

from app.db.base_class import Base

class OrderStatus(str, enum.Enum):
    pending = "pending"
    preparing = "preparing"
    completed = "completed"
    cancelled = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    buyer_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    seller_id: Mapped[str] = mapped_column(ForeignKey("sellers.id", ondelete="RESTRICT"), index=True)
    
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)
    
    # Relationships
    buyer: Mapped["User"] = relationship("User", back_populates="orders")
    seller: Mapped["Seller"] = relationship("Seller", back_populates="orders_received")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    plant_id: Mapped[str] = mapped_column(ForeignKey("plants.id", ondelete="RESTRICT"), index=True)
    
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    plant: Mapped["Plant"] = relationship("Plant", back_populates="order_items")
