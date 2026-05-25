from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from app.api import deps
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.plant import Plant
from app.schemas.order import OrderResponse, OrderCreate, OrderUpdate

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
async def read_orders(db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user), skip: int = 0, limit: int = 100):
    if current_user.role == "admin":
        result = await db.execute(select(Order).options(selectinload(Order.items)).offset(skip).limit(limit))
    elif current_user.role == "seller":
        result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.seller_id == current_user.seller_profile.id).offset(skip).limit(limit))
    else:
        result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.buyer_id == current_user.id).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{order_id}", response_model=OrderResponse)
async def read_order(order_id: str, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.buyer_id != current_user.id and current_user.role != "admin" and (not hasattr(current_user, "seller_profile") or order.seller_id != current_user.seller_profile.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return order

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    total_amount = 0.0
    for item in order_in.items:
        total_amount += item.quantity * item.unit_price
        
    order = Order(
        buyer_id=current_user.id,
        seller_id=order_in.seller_id,
        total_amount=total_amount
    )
    db.add(order)
    await db.flush()
    
    for item in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            plant_id=item.plant_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)
        
    await db.commit()
    await db.refresh(order)
    
    # Load items for response
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order.id))
    return result.scalars().first()

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, order_update: OrderUpdate, db: AsyncSession = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check permissions
    if current_user.role != 'admin' and (not hasattr(current_user, 'seller_profile') or current_user.seller_profile.id != order.seller_id):
         raise HTTPException(status_code=403, detail="Not enough permissions to update order status")
         
    order.status = order_update.status
    await db.commit()
    await db.refresh(order)
    return order