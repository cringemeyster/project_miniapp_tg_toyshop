from fastapi import APIRouter, Query
from sqlalchemy import select, or_

from app.db.session import SessionLocal
from app.db.models import Product, ProductCategory, Order

router = APIRouter(tags=["products"])


@router.get("/products")
async def list_products(
    category: ProductCategory | None = Query(default=None),
):
    async with SessionLocal() as session:
        if category == ProductCategory.repeat:
            ordered_product_ids = select(Order.product_id).distinct()
            stmt = (
                select(Product)
                .where(
                    or_(
                        Product.is_active.is_(False),
                        Product.id.in_(ordered_product_ids),
                    )
                )
                .order_by(Product.created_at.desc())
            )
        else:
            stmt = select(Product).where(Product.is_active.is_(True))

            if category:
                stmt = stmt.where(Product.category == category)

            stmt = stmt.order_by(Product.created_at.desc())

        items = (await session.execute(stmt)).scalars().all()

        return {
            "items": [
                {
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "price_rub": p.price_rub,
                    "old_price_rub": p.old_price_rub,
                    "category": p.category.value,
                    "photos": p.photos,
                    "is_active": p.is_active,
                    "is_repeatable": (not p.is_active),
                }
                for p in items
            ]
        }
