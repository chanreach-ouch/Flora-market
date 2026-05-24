from sqlalchemy import String, Float, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from app.db.base_class import Base

class Seller(Base):
    __tablename__ = "sellers"
    
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    nursery_name: Mapped[str] = mapped_column(String(255), index=True)
    nursery_name_kh: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String)
    description_kh: Mapped[Optional[str]] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String)
    district: Mapped[Optional[str]] = mapped_column(String)
    city: Mapped[Optional[str]] = mapped_column(String)
    
    cover_photo: Mapped[Optional[str]] = mapped_column(String)
    avatar: Mapped[Optional[str]] = mapped_column(String)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_orders: Mapped[int] = mapped_column(Integer, default=0)
    total_plants: Mapped[int] = mapped_column(Integer, default=0)
    year_joined: Mapped[Optional[int]] = mapped_column(Integer)
    
    specialties: Mapped[Optional[list]] = mapped_column(JSONB)
    specialties_kh: Mapped[Optional[list]] = mapped_column(JSONB)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="seller_profile")
    plants: Mapped[List["Plant"]] = relationship("Plant", back_populates="seller", cascade="all, delete-orphan")
    orders_received: Mapped[List["Order"]] = relationship("Order", back_populates="seller")
    reviews_received: Mapped[List["Review"]] = relationship("Review", foreign_keys="[Review.seller_id]", back_populates="seller")
