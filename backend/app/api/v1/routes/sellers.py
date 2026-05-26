from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.seller import Seller
from app.schemas.seller import SellerResponse

router = APIRouter()

@router.get("/", response_model=List[SellerResponse])
async def read_sellers(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    result = await db.execute(select(Seller).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{seller_id}", response_model=SellerResponse)
async def read_seller(
    seller_id: str,
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller