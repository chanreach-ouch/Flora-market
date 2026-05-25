from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewResponse, ReviewCreate

router = APIRouter()

@router.get("/plant/{plant_id}", response_model=List[ReviewResponse])
async def read_plant_reviews(plant_id: str, db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Review).where(Review.plant_id == plant_id).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/seller/{seller_id}", response_model=List[ReviewResponse])
async def read_seller_reviews(seller_id: str, db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Review).where(Review.seller_id == seller_id).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_in: ReviewCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    review = Review(**review_in.model_dump(), buyer_id=current_user.id)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review