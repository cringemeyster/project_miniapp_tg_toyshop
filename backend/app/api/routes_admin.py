from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.deps import require_master
from app.db.session import SessionLocal
from app.db.models import Product, ProductCategory

router = APIRouter(tags=["admin"])


class ProductIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    price_rub: int = Field(ge=1)
    old_price_rub: int | None = Field(default=None, ge=1)
    category: ProductCategory
    photos: list[str] = []
    is_active: bool = True


class ProductUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    price_rub: int = Field(ge=1)
    old_price_rub: int | None = Field(default=None, ge=1)
    category: ProductCategory
    photos: list[str] = []
    is_active: bool = True


@router.get("/admin/products")
async def admin_list_products(user: dict = Depends(require_master)):
    async with SessionLocal() as session:
        items = (
            await session.execute(
                select(Product).order_by(Product.created_at.desc())
            )
        ).scalars().all()

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


@router.post("/admin/products")
async def admin_create_product(payload: ProductIn, user: dict = Depends(require_master)):
    async with SessionLocal() as session:
        p = Product(
            title=payload.title,
            description=payload.description,
            price_rub=payload.price_rub,
            old_price_rub=payload.old_price_rub,
            category=payload.category,
            photos=payload.photos,
            is_active=payload.is_active,
        )
        session.add(p)
        await session.commit()
        await session.refresh(p)
        return {"id": p.id}


@router.patch("/admin/products/{product_id}")
async def admin_update_product(
    product_id: int,
    payload: ProductUpdate,
    user: dict = Depends(require_master),
):
    async with SessionLocal() as session:
        p = await session.get(Product, product_id)
        if not p:
            return {"ok": False, "error": "not found"}

        p.title = payload.title
        p.description = payload.description
        p.price_rub = payload.price_rub
        p.old_price_rub = payload.old_price_rub
        p.category = payload.category
        p.photos = payload.photos
        p.is_active = payload.is_active

        await session.commit()
        await session.refresh(p)

        return {"ok": True, "id": p.id}


@router.patch("/admin/products/{product_id}/active")
async def admin_set_active(
    product_id: int,
    is_active: bool,
    user: dict = Depends(require_master),
):
    async with SessionLocal() as session:
        p = await session.get(Product, product_id)
        if not p:
            return {"ok": False, "error": "not found"}

        p.is_active = is_active
        await session.commit()
        return {"ok": True}
