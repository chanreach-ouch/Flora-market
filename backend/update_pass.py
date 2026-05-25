import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base # Add this to ensure all models are imported and registered
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.future import select
import json

async def check():
    async with AsyncSessionLocal() as db:
        user_result = await db.execute(select(User))
        users = user_result.scalars().all()
        for u in users:
            print(u.email)
            u.hashed_password = get_password_hash('password123')
        await db.commit()
        print('Updated all to password123')

if __name__ == '__main__':
    asyncio.run(check())
