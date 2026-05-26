from sqlalchemy import String, Float, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from app.db.base_class import Base

class Plant(Base):
    __tablename__ = "plants"
    
    seller_id: Mapped[str] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), index=True)
    
    name_en: Mapped[str] = mapped_column(String(255), index=True)
    name_kh: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    
    tagline: Mapped[Optional[str]] = mapped_column(String)
    tagline_kh: Mapped[Optional[str]] = mapped_column(String)
    images: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    
    pros: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    pros_kh: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    cons: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    cons_kh: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    
    water_freq: Mapped[Optional[str]] = mapped_column(String)
    water_freq_kh: Mapped[Optional[str]] = mapped_column(String)
    light_req: Mapped[Optional[str]] = mapped_column(String)
    light_req_kh: Mapped[Optional[str]] = mapped_column(String)
    temp_range: Mapped[Optional[str]] = mapped_column(String)
    difficulty: Mapped[Optional[str]] = mapped_column(String)
    difficulty_kh: Mapped[Optional[str]] = mapped_column(String)
    
    total_sold: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    seller: Mapped[Optional["Seller"]] = relationship("Seller", back_populates="plants")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="plant")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="plant")
    light_req_kh: Mapped[Optional[str]] = mapped_column(String)
    temp_range: Mapped[Optional[str]] = mapped_column(String)
    difficulty: Mapped[Optional[str]] = mapped_column(String)
    difficulty_kh: Mapped[Optional[str]] = mapped_column(String)
    
    total_sold: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    seller: Mapped["Seller"] = relationship("Seller", back_populates="plants")
    reviews: Mapped[List["Review"]] = relationship("Review", foreign_keys="[Review.plant_id]", back_populates="plant")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="plant")
