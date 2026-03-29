import enum
from datetime import datetime

from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Enum, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY

from app.db.base import Base


class ProductCategory(str, enum.Enum):
    toys = "toys"
    keychains = "keychains"
    repeat = "repeat"


class OrderStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    paid = "paid"
    shipped = "shipped"
    canceled = "canceled"
    refund_pending = "refund_pending"


class PVZType(str, enum.Enum):
    ozon = "ozon"
    wb = "wb"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    price_rub: Mapped[int] = mapped_column(Integer)
    old_price_rub: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory), index=True)
    photos: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_tg_id: Mapped[int] = mapped_column(Integer, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(30))
    city: Mapped[str] = mapped_column(String(80))
    pvz_type: Mapped[PVZType] = mapped_column(Enum(PVZType))
    pvz_text: Mapped[str] = mapped_column(String(300))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending_payment, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product")


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (UniqueConstraint("provider_payment_id", name="uq_provider_payment_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    provider: Mapped[str] = mapped_column(String(50))
    provider_payment_id: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), default="created")
    amount: Mapped[int] = mapped_column(Integer)

    order = relationship("Order")


class SketchRequest(Base):
    __tablename__ = "sketch_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_tg_id: Mapped[int] = mapped_column(Integer, index=True)
    username: Mapped[str | None] = mapped_column(String(80), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    photos: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RepeatRequest(Base):
    __tablename__ = "repeat_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_tg_id: Mapped[int] = mapped_column(Integer, index=True)
    username: Mapped[str | None] = mapped_column(String(80), nullable=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
