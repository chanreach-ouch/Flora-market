from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.api import deps
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate, UserStatusUpdate

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(deps.get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    update: UserUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.phone is not None:
        current_user.phone = update.phone
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ── Admin-only routes ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 200,
    role: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db),
    _admin: User = Depends(deps.get_current_admin),
):
    query = select(User)
    if role:
        try:
            query = query.where(User.role == UserRole(role))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(deps.get_db),
    _admin: User = Depends(deps.get_current_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    update: UserStatusUpdate,
    db: AsyncSession = Depends(deps.get_db),
    admin: User = Depends(deps.get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = update.is_active
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(deps.get_db),
    admin: User = Depends(deps.get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
