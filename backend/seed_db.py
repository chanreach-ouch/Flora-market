import asyncio
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import Base # Add this to ensure all models are imported and registered
from app.db.session import AsyncSessionLocal
from app.models.seller import Seller
from app.models.user import User
from app.models.plant import Plant
from sqlalchemy.future import select

async def seed_plants():
    async with AsyncSessionLocal() as db:
        # First, ensure we have a seller
        user_result = await db.execute(select(User).limit(1))
        user = user_result.scalars().first()
        
        if not user:
            print("No users found. Creating a test user...")
            user = User(
                email="seller@example.com",
                hashed_password="fakehash",
                full_name="Plant Seller",
                role="seller"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        seller_result = await db.execute(select(Seller).where(Seller.user_id == user.id))
        seller = seller_result.scalars().first()
        
        if not seller:
            print("Creating a seller profile...")
            seller = Seller(
                user_id=user.id,
                nursery_name="Green Haven Nursery",
                nursery_name_kh="សួនបៃតង",
                description="We sell lovely plants.",
                is_verified=True,
                rating=4.8,
                total_plants=2
            )
            db.add(seller)
            await db.commit()
            await db.refresh(seller)

        # Create some plants
        plants_data = [
            {
                "name_en": "Monstera Deliciosa",
                "name_kh": "ម៉ុងស្ទែរ៉ា",
                "category": "Indoor",
                "price": 25.50,
                "stock": 10,
                "seller_id": seller.id,
                "tagline": "The trendy Swiss Cheese Plant",
                "images": ["/images/plants/monstera.jpg"],
                "is_new": True,
                "is_active": True
            },
            {
                "name_en": "Golden Pothos",
                "name_kh": "វល្លិ៍មាស",
                "category": "Air Purifying",
                "price": 8.00,
                "stock": 45,
                "seller_id": seller.id,
                "tagline": "Easiest houseplant to grow",
                "images": ["/images/plants/golden-pothos.jpg"],
                "is_new": False,
                "is_active": True
            }
        ]
        
        for data in plants_data:
            plant = Plant(**data)
            db.add(plant)
            
        await db.commit()
        print("Plants seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_plants())