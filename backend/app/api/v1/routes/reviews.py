from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.review import Review
from app.models.user import User
from app.models.plant import Plant
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()

@router.get("/plant/{plant_id}", response_model=List[ReviewResponse])
async def read_plant_reviews(
    plant_id: str,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    result = await db.execute(select(Review).where(Review.plant_id == plant_id).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    review = Review(
        buyer_id=current_user.id,
        seller_id=review_in.seller_id,
        plant_id=review_in.plant_id,
        rating=review_in.rating,
        comment=review_in.comment,
        comment_kh=review_in.comment_kh
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    # Optional: Update plant rating/review count
    plant_res = await db.execute(select(Plant).where(Plant.id == review_in.plant_id))
    plant = plant_res.scalars().first()
    if plant:
        plant.review_count += 1
        # Simplified running average update
        plant.rating = ((plant.rating * (plant.review_count - 1)) + review.rating) / plant.review_count
        await db.commit()
        
    return review