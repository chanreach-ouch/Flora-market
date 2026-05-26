from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from app.api import deps
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.plant import Plant
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
async def read_orders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    query = select(Order).options(selectinload(Order.items))
    if current_user.role == "buyer" or current_user.role == "customer":
        query = query.where(Order.buyer_id == current_user.id)
    elif current_user.role == "seller":
        query = query.where(Order.seller_id == current_user.seller_profile.id) # Depending on loaded relations. Simplification:
        # For full implementation, sellers may need to see their received orders.
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    total = 0.0
    items_to_create = []
    
    for item in order_in.items:
        plant_res = await db.execute(select(Plant).where(Plant.id == item.plant_id))
        plant = plant_res.scalars().first()
        if not plant:
            raise HTTPException(status_code=404, detail=f"Plant {item.plant_id} not found")
        if plant.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {plant.name_en}")
        
        unit_price = plant.price
        total += unit_price * item.quantity
        items_to_create.append(OrderItem(plant_id=item.plant_id, quantity=item.quantity, unit_price=unit_price))
        
        # update stock
        plant.stock -= item.quantity
        
    order = Order(
        buyer_id=current_user.id,
        seller_id=order_in.seller_id,
        total_amount=total,
        items=items_to_create
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order