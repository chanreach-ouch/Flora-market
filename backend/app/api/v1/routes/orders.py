from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.api import deps
from app.models.order import Order, OrderItem, OrderStatus
from app.models.plant import Plant
from app.models.seller import Seller
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter()


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


@router.get("/", response_model=List[OrderResponse])
async def list_all_orders(
    skip: int = 0,
    limit: int = 200,
    status: Optional[OrderStatus] = None,
    db: AsyncSession = Depends(deps.get_db),
    _admin: User = Depends(deps.get_current_admin),
):
    """List all orders (admin only). Optionally filter by status."""
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if status:
        query = query.where(Order.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


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
                detail=f"Insufficient stock for {plant.name_en}. Available: {plant.stock}",
            )
        total_amount += plant.price * item.quantity
        items_to_create.append((plant, item.quantity))

    order = Order(
        buyer_id=current_user.id,
        seller_id=order_in.seller_id,
        total_amount=total_amount,
        status=OrderStatus.pending,
    )
    db.add(order)
    await db.flush()

    for plant, quantity in items_to_create:
        db.add(OrderItem(
            order_id=order.id,
            plant_id=plant.id,
            quantity=quantity,
            unit_price=plant.price,
        ))
        plant.stock -= quantity
        plant.total_sold += quantity

    # Keep seller total_orders accurate
    result = await db.execute(select(Seller).where(Seller.id == order_in.seller_id))
    seller = result.scalars().first()
    if seller:
        seller.total_orders += 1

    await db.commit()

    # Reload with items eagerly to avoid async lazy-load error in response serialization
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalars().first()


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Update order status. Seller updates their own orders; admin can update any."""
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    from app.models.user import UserRole
    admin_roles = {UserRole.admin, UserRole.super_admin, UserRole.manager}
    if current_user.role not in admin_roles:
        result = await db.execute(select(Seller).where(Seller.user_id == current_user.id))
        seller = result.scalars().first()
        if not seller or order.seller_id != seller.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this order")

    order.status = update.status
    await db.commit()
    await db.refresh(order)
    return order
