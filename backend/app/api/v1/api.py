from fastapi import APIRouter
from app.api.v1.routes import auth, plants, users, sellers, orders, reviews, stats

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(sellers.router, prefix="/sellers", tags=["sellers"])
api_router.include_router(plants.router, prefix="/plants", tags=["plants"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
