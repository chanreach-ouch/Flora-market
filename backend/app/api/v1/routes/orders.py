from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api import deps
from app.models.order import Order, OrderItem, OrderStatus
from app.models.plant import Plant
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def place_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Place a new order. Validates stock and creates order items."""
    total_amount = 0.0
    items_to_create = []

    for item in order_in.items:
        result = await db.execute(select(Plant).where(Plant.id == item.plant_id))
        plant = result.scalars().first()
        if not plant:
            raise HTTPException(status_code=404, detail=f"Plant {item.plant_id} not found")
        if plant.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {plant.name_en}. Available: {plant.stock}"
            )
        total_amount += plant.price * item.quantity
        items_to_create.append((plant, item.quantity))

    # Create the order
    order = Order(
        buyer_id=current_user.id,
        seller_id=order_in.seller_id,
        total_amount=total_amount,
        status=OrderStatus.pending,
    )
    db.add(order)
    await db.flush()  # Get order.id without committing

    # Create order items and deduct stock
    for plant, quantity in items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            plant_id=plant.id,
            quantity=quantity,
            unit_price=plant.price,
        )
        db.add(order_item)
        plant.stock -= quantity
        plant.total_sold += quantity

    await db.commit()
    await db.refresh(order)
    return order


@router.get("/me", response_model=List[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get all orders placed by the authenticated buyer."""
    result = await db.execute(
        select(Order)
        .where(Order.buyer_id == current_user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/seller", response_model=List[OrderResponse])
async def get_seller_orders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get all orders received by the authenticated seller."""
    from app.models.seller import Seller
    result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
    seller = result.scalars().first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    result = await db.execute(
        select(Order)
        .where(Order.seller_id == seller.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status: OrderStatus,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update order status (seller only). Advances: pending → preparing → completed."""
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    await db.commit()
    await db.refresh(order)
    return order
