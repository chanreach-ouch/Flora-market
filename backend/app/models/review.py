from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from app.db.base_class import Base

class Review(Base):
    __tablename__ = "reviews"
    
    buyer_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[str] = mapped_column(ForeignKey("sellers.id", ondelete="CASCADE"), index=True)
    plant_id: Mapped[str] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), index=True)
    
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(String)
    comment_kh: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    buyer: Mapped["User"] = relationship("User", back_populates="reviews")
    seller: Mapped["Seller"] = relationship("Seller", back_populates="reviews_received", foreign_keys=[seller_id])
    plant: Mapped["Plant"] = relationship("Plant", back_populates="reviews", foreign_keys=[plant_id])
