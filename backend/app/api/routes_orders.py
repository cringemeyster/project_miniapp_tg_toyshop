from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.api.deps import get_tg_user
from app.db.session import SessionLocal
from app.db.models import Order, PVZType, OrderStatus, Product
from app.bot.messages import send_new_order_to_master

router = APIRouter(tags=["orders"])

class OrderIn(BaseModel):
    product_id: int
    full_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=3, max_length=30)
    city: str = Field(min_length=1, max_length=80)
    pvz_type: PVZType
    pvz_text: str = Field(min_length=1, max_length=300)

@router.post("/orders")
async def create_order(payload: OrderIn, user: dict = Depends(get_tg_user)):
    async with SessionLocal() as session:
        product = await session.get(Product, payload.product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail="Product not found")

        o = Order(
            user_tg_id=int(user["id"]),
            product_id=payload.product_id,
            full_name=payload.full_name,
            phone=payload.phone,
            city=payload.city,
            pvz_type=payload.pvz_type,
            pvz_text=payload.pvz_text,
            status=OrderStatus.pending_payment,
        )
        session.add(o)
        await session.commit()
        await session.refresh(o)

        await send_new_order_to_master(
            order_id=o.id,
            user_id=int(user["id"]),
            username=user.get("username"),
            product_title=product.title,
            full_name=o.full_name,
            phone=o.phone,
            city=o.city,
            pvz_type=o.pvz_type.value,
            pvz_text=o.pvz_text,
        )

        return {"id": o.id, "status": o.status.value}


class OrderItemIn(BaseModel):
    product_id: int

class OrderBulkIn(BaseModel):
    items: list[OrderItemIn]
    full_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=3, max_length=30)
    city: str = Field(min_length=1, max_length=80)
    pvz_type: PVZType
    pvz_text: str = Field(min_length=1, max_length=300)

@router.post("/orders/bulk")
async def create_bulk_order(payload: OrderBulkIn, user: dict = Depends(get_tg_user)):
    async with SessionLocal() as session:
        orders_created = 0
        for item in payload.items:
            product = await session.get(Product, item.product_id)
            if not product or not product.is_active:
                continue  # Skip inactive or missing products

            o = Order(
                user_tg_id=int(user["id"]),
                product_id=item.product_id,
                full_name=payload.full_name,
                phone=payload.phone,
                city=payload.city,
                pvz_type=payload.pvz_type,
                pvz_text=payload.pvz_text,
                status=OrderStatus.pending_payment,
            )
            session.add(o)
            await session.commit()
            await session.refresh(o)

            await send_new_order_to_master(
                order_id=o.id,
                user_id=int(user["id"]),
                username=user.get("username"),
                product_title=product.title,
                full_name=o.full_name,
                phone=o.phone,
                city=o.city,
                pvz_type=o.pvz_type.value,
                pvz_text=o.pvz_text,
            )
            orders_created += 1

        if orders_created == 0:
            raise HTTPException(status_code=400, detail="No valid products to order")

        return {"count": orders_created}
