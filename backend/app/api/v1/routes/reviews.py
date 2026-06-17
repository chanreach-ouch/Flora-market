from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.models.review import Review
from app.models.plant import Plant
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()


@router.get("/plant/{plant_id}", response_model=List[ReviewResponse])
async def get_reviews_by_plant(plant_id: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Review).where(Review.plant_id == plant_id))
    return result.scalars().all()


@router.get("/seller/{seller_id}", response_model=List[ReviewResponse])
async def get_reviews_by_seller(seller_id: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Review).where(Review.seller_id == seller_id))
    return result.scalars().all()


@router.get("/", response_model=List[ReviewResponse])
async def list_all_reviews(
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(deps.get_db),
    _admin: User = Depends(deps.get_current_admin),
):
    """List all reviews (admin only)."""
    result = await db.execute(
        select(Review).order_by(Review.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Submit a review for a plant/seller."""
    result = await db.execute(select(Plant).where(Plant.id == review_in.plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    review = Review(
        buyer_id=current_user.id,
        seller_id=review_in.seller_id,
        plant_id=review_in.plant_id,
        rating=review_in.rating,
        comment=review_in.comment,
        comment_kh=review_in.comment_kh,
    )
    db.add(review)

    # Recalculate plant rating
    result = await db.execute(select(Review).where(Review.plant_id == review_in.plant_id))
    existing = result.scalars().all()
    total = sum(r.rating for r in existing) + review_in.rating
    plant.review_count = len(existing) + 1
    plant.rating = round(total / plant.review_count, 1)

    await db.commit()
    await db.refresh(review)
    return review
