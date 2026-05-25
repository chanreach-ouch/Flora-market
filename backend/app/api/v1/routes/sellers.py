from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.seller import Seller
from app.models.user import User
from app.schemas.seller import SellerResponse, SellerCreate, SellerUpdate

router = APIRouter()

@router.get("/", response_model=List[SellerResponse])
async def read_sellers(db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Seller).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{seller_id}", response_model=SellerResponse)
async def read_seller(seller_id: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller

@router.post("/", response_model=SellerResponse, status_code=status.HTTP_201_CREATED)
async def create_seller(seller_in: SellerCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User already has a seller profile")
    
    seller = Seller(**seller_in.model_dump(), user_id=current_user.id)
    db.add(seller)
    await db.commit()
    await db.refresh(seller)
    return seller

@router.put("/{seller_id}", response_model=SellerResponse)
async def update_seller(seller_id: str, seller_in: SellerUpdate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    if seller.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = seller_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(seller, field, value)
        
    await db.commit()
    await db.refresh(seller)
    return seller