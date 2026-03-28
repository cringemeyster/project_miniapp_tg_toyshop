from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import get_tg_user
from app.bot.messages import send_repeat_request_to_master
from app.db.models import Product, RepeatRequest
from app.db.session import SessionLocal

router = APIRouter(tags=["repeat"])


class RepeatRequestIn(BaseModel):
    product_id: int
    text: str = Field(min_length=1, max_length=2000)


@router.post("/repeat")
async def create_repeat_request(payload: RepeatRequestIn, user: dict = Depends(get_tg_user)):
    async with SessionLocal() as session:
        product = await session.get(Product, payload.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        req = RepeatRequest(
            user_tg_id=int(user["id"]),
            username=user.get("username"),
            product_id=product.id,
            text=payload.text,
        )
        session.add(req)
        await session.commit()
        await session.refresh(req)

        await send_repeat_request_to_master(
            repeat_request_id=req.id,
            user_id=int(user["id"]),
            username=user.get("username"),
            product_title=product.title,
            text_value=req.text,
        )

        return {"ok": True, "id": req.id}
