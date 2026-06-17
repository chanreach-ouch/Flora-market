from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

from app.api import deps
from app.models.user import User
from app.models.seller import Seller
from app.models.plant import Plant
from app.models.order import Order, OrderStatus
from app.models.review import Review

router = APIRouter()


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float
    commission: float
    orders: int


class PlatformStats(BaseModel):
    total_users: int
    active_sellers: int
    total_plants: int
    total_orders: int
    total_revenue: float
    total_commission: float
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    monthly_revenue: List[MonthlyRevenue]


@router.get("/", response_model=PlatformStats)
async def get_platform_stats(
    db: AsyncSession = Depends(deps.get_db),
    _admin: User = Depends(deps.get_current_admin),
):
    """Platform-wide analytics (admin only)."""
    COMMISSION_RATE = 0.05

    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_sellers = (await db.execute(select(func.count(Seller.id)))).scalar() or 0
    total_plants = (await db.execute(
        select(func.count(Plant.id)).where(Plant.is_active == True)
    )).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0

    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.pending)
    )).scalar() or 0
    completed_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.completed)
    )).scalar() or 0
    cancelled_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.cancelled)
    )).scalar() or 0

    total_revenue_raw = (await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.completed)
    )).scalar() or 0.0
    total_revenue = round(float(total_revenue_raw), 2)
    total_commission = round(total_revenue * COMMISSION_RATE, 2)

    # Last 12 months of revenue
    monthly_revenue: List[MonthlyRevenue] = []
    now = datetime.utcnow()
    for i in range(11, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        rev_raw = (await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.status == OrderStatus.completed,
                Order.created_at >= month_start,
                Order.created_at < month_end,
            )
        )).scalar() or 0.0
        rev = round(float(rev_raw), 2)

        order_count = (await db.execute(
            select(func.count(Order.id)).where(
                Order.created_at >= month_start,
                Order.created_at < month_end,
            )
        )).scalar() or 0

        monthly_revenue.append(MonthlyRevenue(
            month=month_start.strftime("%b %y"),
            revenue=rev,
            commission=round(rev * COMMISSION_RATE, 2),
            orders=order_count,
        ))

    return PlatformStats(
        total_users=total_users,
        active_sellers=active_sellers,
        total_plants=total_plants,
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_commission=total_commission,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        monthly_revenue=monthly_revenue,
    )
