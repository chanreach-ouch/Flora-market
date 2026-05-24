import os

files = {
    "app/core/security.py": '''from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
''',
    
    "app/api/deps.py": '''from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
''',

    "app/schemas/token.py": '''from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str = None
''',

    "app/schemas/user.py": '''from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
''',

    "app/schemas/plant.py": '''from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PlantBase(BaseModel):
    name_en: str
    name_kh: str
    category: str
    price: float
    stock: int
    tagline: Optional[str] = None
    tagline_kh: Optional[str] = None
    images: Optional[List[str]] = []

class PlantResponse(PlantBase):
    id: str
    seller_id: str
    created_at: datetime

    class Config:
        from_attributes = True
''',

    "app/api/v1/routes/auth.py": '''from fastapi import APIRouter, Depends, HTTPException, status
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
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    import datetime
    from app.core.config import settings
    access_token_expires = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
''',

    "app/api/v1/routes/plants.py": '''from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.plant import Plant
from app.schemas.plant import PlantResponse

router = APIRouter()

@router.get("/", response_model=List[PlantResponse])
async def read_plants(db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Plant).offset(skip).limit(limit))
    return result.scalars().all()
''',

    "app/api/v1/api.py": '''from fastapi import APIRouter
from app.api.v1.routes import auth, plants

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(plants.router, prefix="/plants", tags=["plants"])
'''
}

for filepath, content in files.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("API files scaffolded!")
