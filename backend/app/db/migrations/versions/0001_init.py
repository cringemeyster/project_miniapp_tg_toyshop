"""init tables

Revision ID: 0001_init
Revises: 
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("price_rub", sa.Integer(), nullable=False),
        sa.Column("category", sa.Enum("toys", "keychains", name="productcategory"), nullable=False),
        sa.Column("photos", postgresql.ARRAY(sa.String()), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_products_category", "products", ["category"])
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_tg_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("city", sa.String(length=80), nullable=False),
        sa.Column("pvz_type", sa.Enum("ozon", "wb", name="pvztype"), nullable=False),
        sa.Column("pvz_text", sa.String(length=300), nullable=False),
        sa.Column("status", sa.Enum("pending_payment", "paid", "shipped", "canceled", "refund_pending", name="orderstatus"), nullable=False, server_default="pending_payment"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_orders_user_tg_id", "orders", ["user_tg_id"])
    op.create_index("ix_orders_status", "orders", ["status"])

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_payment_id", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="created"),
        sa.Column("amount", sa.Integer(), nullable=False),
    )
    op.create_unique_constraint("uq_provider_payment_id", "payments", ["provider_payment_id"])
    op.create_index("ix_payments_order_id", "payments", ["order_id"])

    op.create_table(
        "sketch_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_tg_id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("photos", postgresql.ARRAY(sa.String()), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_sketch_requests_user_tg_id", "sketch_requests", ["user_tg_id"])

def downgrade():
    op.drop_index("ix_sketch_requests_user_tg_id", table_name="sketch_requests")
    op.drop_table("sketch_requests")
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_constraint("uq_provider_payment_id", "payments", type_="unique")
    op.drop_table("payments")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_user_tg_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_products_category", table_name="products")
    op.drop_table("products")
    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS pvztype")
    op.execute("DROP TYPE IF EXISTS productcategory")
