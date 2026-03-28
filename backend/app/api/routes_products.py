from fastapi import APIRouter, Query
from sqlalchemy import select

from app.db.session import SessionLocal
from app.db.models import Product, ProductCategory

router = APIRouter(tags=["products"])


@router.get("/products")
async def list_products(
    category: ProductCategory | None = Query(default=None),
):
    async with SessionLocal() as session:
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
                }
                for p in items
            ]
        }
