from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(db: AsyncSession = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    from sqlalchemy import or_
    result = await db.execute(select(User).where(or_(User.email == form_data.username, User.phone == form_data.username)))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect login credentials")
    
    import datetime
    from app.core.config import settings
    access_token_expires = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(str(user.id), expires_delta=access_token_expires),
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(deps.get_db)):
    from sqlalchemy import or_
    
    if not user_in.email and not user_in.phone:
        raise HTTPException(status_code=400, detail="Email or phone must be provided")

    conditions = []
    if user_in.email:
        conditions.append(User.email == user_in.email)
    if user_in.phone:
        conditions.append(User.phone == user_in.phone)
        
    result = await db.execute(select(User).where(or_(*conditions)))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
    
    user = User(
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
