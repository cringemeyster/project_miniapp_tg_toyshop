"""add repeat category and repeat requests

Revision ID: 0003_repeat_category_and_requests
Revises: 0002_product_old_price
Create Date: 2026-03-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_repeat_req"
down_revision = "0002_product_old_price"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE productcategory ADD VALUE IF NOT EXISTS 'repeat'")

    op.create_table(
        "repeat_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_tg_id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_repeat_requests_user_tg_id", "repeat_requests", ["user_tg_id"])
    op.create_index("ix_repeat_requests_product_id", "repeat_requests", ["product_id"])


def downgrade():
    op.drop_index("ix_repeat_requests_product_id", table_name="repeat_requests")
    op.drop_index("ix_repeat_requests_user_tg_id", table_name="repeat_requests")
    op.drop_table("repeat_requests")
