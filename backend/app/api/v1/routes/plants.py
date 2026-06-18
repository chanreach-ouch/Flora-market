from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional

from app.api import deps
from app.models.plant import Plant
from app.models.seller import Seller
from app.models.user import User, UserRole
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse

router = APIRouter()


@router.get("/", response_model=List[PlantResponse])
async def list_plants(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    include_inactive: bool = False,
    current_user: Optional[User] = Depends(deps.get_optional_user),
):
    """List plants. Admins can pass include_inactive=true to see all plants."""
    admin_roles = {UserRole.admin, UserRole.super_admin, UserRole.manager}
    is_admin = current_user is not None and current_user.role in admin_roles

    query = select(Plant)
    if not (include_inactive and is_admin):
        query = query.where(Plant.is_active == True)
    if category and category != "All":
        query = query.where(Plant.category == category)
    query = query.offset(skip).limit(limit).order_by(Plant.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/seller/{seller_id}", response_model=List[PlantResponse])
async def get_plants_by_seller(seller_id: str, db: AsyncSession = Depends(deps.get_db)):
    """Get all active plants for a specific seller."""
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
    plant_in: PlantCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create a new plant listing. Auto-creates a seller profile if none exists."""
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()

    if not seller:
        import datetime as dt
        seller = Seller(
            user_id=current_user.id,
            nursery_name=current_user.full_name or current_user.email,
            year_joined=dt.datetime.utcnow().year,
        )
        db.add(seller)
        await db.flush()

    plant_data = plant_in.model_dump()
    plant_data['name_kh'] = plant_data.get('name_kh') or plant_data['name_en']
    plant = Plant(seller_id=seller.id, **plant_data)
    db.add(plant)
    await db.flush()

    # Keep total_plants accurate
    count_result = await db.execute(
        select(func.count(Plant.id)).where(Plant.seller_id == seller.id)
    )
    seller.total_plants = count_result.scalar() or 0

    await db.commit()
    await db.refresh(plant)
    return plant


@router.patch("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: str,
    plant_in: PlantUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Partial update of a plant listing. Only the owner can edit."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()
    if not seller or plant.seller_id != seller.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this plant")

    for field, value in plant_in.model_dump(exclude_none=True).items():
        setattr(plant, field, value)

    await db.commit()
    await db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=204)
async def delete_plant(
    plant_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete a plant listing. Only the owner can delete."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()
    if not seller or plant.seller_id != seller.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this plant")

    await db.delete(plant)
    await db.flush()

    # Recount total_plants after deletion
    count_result = await db.execute(
        select(func.count(Plant.id)).where(Plant.seller_id == seller.id)
    )
    seller.total_plants = count_result.scalar() or 0

    await db.commit()


@router.patch("/{plant_id}/toggle", response_model=PlantResponse)
async def toggle_plant_active(
    plant_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Toggle plant active/inactive. Owner or admin."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = result.scalars().first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    admin_roles = {UserRole.admin, UserRole.super_admin, UserRole.manager}
    if current_user.role not in admin_roles:
        result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
        seller = result.scalars().first()
        if not seller or plant.seller_id != seller.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    plant.is_active = not plant.is_active
    await db.commit()
    await db.refresh(plant)
    return plant
