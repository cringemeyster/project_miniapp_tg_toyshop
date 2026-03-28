from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from app.api.deps import get_tg_user
from app.db.session import SessionLocal
from app.db.models import SketchRequest
from app.bot.messages import send_new_sketch_to_master

router = APIRouter(tags=["sketch"])

class SketchIn(BaseModel):
    text: str = Field(min_length=1)
    photos: list[str] = []

@router.post("/sketch")
async def create_sketch(payload: SketchIn, user: dict = Depends(get_tg_user)):
    async with SessionLocal() as session:
        s = SketchRequest(
            user_tg_id=int(user["id"]),
            username=user.get("username"),
            text=payload.text,
            photos=payload.photos,
        )
        session.add(s)
        await session.commit()
        await session.refresh(s)

        await send_new_sketch_to_master(
            sketch_id=s.id,
            user_id=int(user["id"]),
            username=user.get("username"),
            text_value=s.text,
        )

        return {"ok": True, "id": s.id}
