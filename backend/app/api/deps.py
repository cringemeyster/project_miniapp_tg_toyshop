from fastapi import Header, HTTPException
from app.core.security import verify_telegram_init_data, TelegramAuthError
from app.core.config import settings

async def get_tg_user(
    x_tg_init_data: str = Header(default=""),
) -> dict:
    print("DEBUG x_tg_init_data exists:", bool(x_tg_init_data))
    print("DEBUG x_tg_init_data length:", len(x_tg_init_data or ""))

    if not x_tg_init_data:
        raise HTTPException(status_code=401, detail="Missing Telegram initData")

    try:
        return verify_telegram_init_data(x_tg_init_data)
    except TelegramAuthError as e:
        print("DEBUG TelegramAuthError:", str(e))
        raise HTTPException(status_code=401, detail=str(e))

async def require_master(
    x_tg_init_data: str = Header(default=""),
) -> dict:
    user = await get_tg_user(x_tg_init_data=x_tg_init_data)

    if int(user["id"]) != int(settings.MASTER_TG_ID):
        raise HTTPException(status_code=403, detail="Only master can access admin")

    return user
