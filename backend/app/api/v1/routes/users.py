from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(deps.get_current_user)):
    """Get the currently authenticated user's full profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    full_name: str = None,
    phone: str = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update the authenticated user's name or phone."""
    if full_name is not None:
        current_user.full_name = full_name
    if phone is not None:
        current_user.phone = phone
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
