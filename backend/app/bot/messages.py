from app.bot.client import bot
from app.core.config import settings


async def send_new_order_to_master(
    order_id: int,
    user_id: int,
    username: str | None,
    product_title: str,
    full_name: str,
    phone: str,
    city: str,
    pvz_type: str,
    pvz_text: str,
):
    username_line = f"Username: @{username}" if username else "Username: —"

    text = (
        f"🛒 Новый заказ #{order_id}\n\n"
        f"Товар: {product_title}\n"
        f"Покупатель: {full_name}\n"
        f"Телефон: {phone}\n"
        f"Город: {city}\n"
        f"ПВЗ: {pvz_type}\n"
        f"Адрес/номер ПВЗ: {pvz_text}\n\n"
        f"Telegram ID: {user_id}\n"
        f"{username_line}"
    )

    await bot.send_message(chat_id=settings.MASTER_TG_ID, text=text)


async def send_new_sketch_to_master(
    sketch_id: int,
    user_id: int,
    username: str | None,
    text_value: str,
):
    username_line = f"Username: @{username}" if username else "Username: —"

    text = (
        f"🎨 Новая заявка на эскиз #{sketch_id}\n\n"
        f"Описание:\n{text_value}\n\n"
        f"Telegram ID: {user_id}\n"
        f"{username_line}"
    )

    await bot.send_message(chat_id=settings.MASTER_TG_ID, text=text)
