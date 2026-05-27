from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(db: AsyncSession = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # Support login by email or phone
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    # Try phone if email lookup failed
    if not user:
        result = await db.execute(select(User).where(User.phone == form_data.username))
        user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    import datetime
    from app.core.config import settings
    access_token_expires = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(deps.get_db)):
    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Check phone uniqueness (if provided)
    if user_in.phone:
        result = await db.execute(select(User).where(User.phone == user_in.phone))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="User with this phone already exists")
    
    # Map frontend role ('buyer'→ customer, 'seller'→ seller)
    role = user_in.role
    if role == UserRole.customer or str(role) in ['buyer', 'customer']:
        mapped_role = UserRole.customer
    elif str(role) in ['seller']:
        mapped_role = UserRole.seller
    else:
        mapped_role = UserRole.customer

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=mapped_role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(deps.get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user

