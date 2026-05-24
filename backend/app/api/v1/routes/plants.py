from fastapi import APIRouter, Depends
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
