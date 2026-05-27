from sqlalchemy import String, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import enum
import uuid

from app.db.base_class import Base

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    manager = "manager"
    customer = "customer"
    seller = "seller"

class User(Base):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.customer)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    seller_profile: Mapped[Optional["Seller"]] = relationship("Seller", back_populates="user", cascade="all, delete-orphan", uselist=False)
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="buyer")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="buyer")
