import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from app.core.config import settings


class TelegramAuthError(Exception):
    pass


def verify_telegram_init_data(init_data: str) -> dict:
    """Проверяет подпись initData (Telegram MiniApp) и возвращает user dict."""
    if not init_data:
        raise TelegramAuthError("initData is empty")

    pairs = parse_qsl(init_data, keep_blank_values=True)
    data = dict(pairs)

    received_hash = data.pop("hash", None)
    if not received_hash:
        raise TelegramAuthError("hash is missing in initData")

    # data_check_string: строки key=value, отсортированные по ключу, через \n
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(data.items(), key=lambda x: x[0])
    )

    # secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.BOT_TOKEN.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise TelegramAuthError("initData signature is invalid")

    user_raw = data.get("user")
    if not user_raw:
        raise TelegramAuthError("user is missing in initData")

    return json.loads(user_raw)
