from fastapi import Header, HTTPException
from app.core.security import verify_telegram_init_data, TelegramAuthError
from app.core.config import settings

from fastapi import Depends

async def get_current_user(
    x_platform: str = Header(default="tg"),
    x_tg_init_data: str = Header(default=""),
    x_web_user_id: str = Header(default=""),
) -> dict:
    if x_platform == "web":
        if not x_web_user_id:
            raise HTTPException(status_code=401, detail="Missing Web User ID")
        return {"id": x_web_user_id, "platform": "web", "username": "Web Guest"}

    if x_platform == "tg":
        if not x_tg_init_data:
            raise HTTPException(status_code=401, detail="Missing Telegram initData")
        try:
            user = verify_telegram_init_data(x_tg_init_data)
            user["platform"] = "tg"
            return user
        except TelegramAuthError as e:
            raise HTTPException(status_code=401, detail=str(e))

    raise HTTPException(status_code=400, detail="Invalid platform")

async def get_tg_user(user: dict = Depends(get_current_user)) -> dict:
    # Retained for backwards compatibility if needed, but updated routes will use get_current_user
    return user

async def require_master(user: dict = Depends(get_current_user)) -> dict:
    if user.get("platform") != "tg":
        raise HTTPException(status_code=403, detail="Only master can access admin")

    try:
        if int(user["id"]) != int(settings.MASTER_TG_ID):
            raise HTTPException(status_code=403, detail="Only master can access admin")
    except ValueError:
        raise HTTPException(status_code=403, detail="Invalid master ID format")

    return user
