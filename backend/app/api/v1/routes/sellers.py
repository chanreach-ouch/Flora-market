from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api import deps
from app.models.seller import Seller
from app.models.user import User
from app.schemas.seller import SellerResponse, SellerCreate

router = APIRouter()


@router.get("/", response_model=List[SellerResponse])
async def list_sellers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
):
    """List all sellers (verified nurseries)."""
    result = await db.execute(select(Seller).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/me", response_model=SellerResponse)
async def get_my_seller_profile(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get the seller profile for the currently authenticated seller user."""
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found. Please contact support.")
    return seller


@router.get("/{seller_id}", response_model=SellerResponse)
async def get_seller(seller_id: str, db: AsyncSession = Depends(deps.get_db)):
    """Get a specific seller by ID."""
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller


@router.post("/", response_model=SellerResponse)
async def create_seller_profile(
    seller_in: SellerCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a seller profile for the authenticated user."""
    # Check if profile already exists
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Seller profile already exists")

    seller = Seller(
        user_id=current_user.id,
        nursery_name=seller_in.nursery_name,
        nursery_name_kh=seller_in.nursery_name_kh,
        description=seller_in.description,
        description_kh=seller_in.description_kh,
        location=seller_in.location,
        district=seller_in.district,
        city=seller_in.city,
        specialties=seller_in.specialties or [],
        specialties_kh=seller_in.specialties_kh or [],
    )
    db.add(seller)
    await db.commit()
    await db.refresh(seller)
    return seller
