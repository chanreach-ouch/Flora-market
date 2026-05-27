from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.api import deps
from app.models.plant import Plant
from app.models.seller import Seller
from app.models.user import User
from app.schemas.plant import PlantResponse

router = APIRouter()


@router.get("/", response_model=List[PlantResponse])
async def list_plants(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
):
    """List all active plants. Filter by category."""
    query = select(Plant).where(Plant.is_active == True)
    if category and category != "All":
        query = query.where(Plant.category == category)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/seller/{seller_id}", response_model=List[PlantResponse])
async def get_plants_by_seller(seller_id: str, db: AsyncSession = Depends(deps.get_db)):
    """Get all plants for a specific seller."""
    result = await db.execute(
        select(Plant).where(Plant.seller_id == seller_id, Plant.is_active == True)
    )
    return result.scalars().all()


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(plant_id: str, db: AsyncSession = Depends(deps.get_db)):
    """Get a specific plant by ID."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


@router.post("/", response_model=PlantResponse)
async def create_plant(
    plant_data: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a new plant listing (seller only)."""
    # Get seller profile for this user
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=403, detail="Only sellers can add plants")

    plant = Plant(seller_id=seller.id, **plant_data)
    db.add(plant)
    await db.commit()
    await db.refresh(plant)
    return plant


@router.patch("/{plant_id}/toggle", response_model=PlantResponse)
async def toggle_plant_active(
    plant_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Toggle plant active/inactive status (seller only)."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    plant.is_active = not plant.is_active
    await db.commit()
    await db.refresh(plant)
    return plant
