from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_in: UserUpdate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        from app.core.security import get_password_hash
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
        
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    await db.commit()
    await db.refresh(current_user)
    return current_user