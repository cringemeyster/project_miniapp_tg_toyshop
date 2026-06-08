"""multiplatform architecture

Revision ID: 0004_multiplatform
Revises: 0003_repeat_category_and_requests
Create Date: 2026-03-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_multiplatform"
down_revision = "0003_repeat_req"
branch_labels = None
depends_on = None

def upgrade():
    # Orders
    op.add_column("orders", sa.Column("external_user_id", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("platform", sa.String(length=20), server_default="tg", nullable=False))

    # Populate new external_user_id from user_tg_id
    op.execute("UPDATE orders SET external_user_id = user_tg_id::text")

    op.alter_column("orders", "external_user_id", nullable=False)
    op.create_index("ix_orders_external_user_id", "orders", ["external_user_id"])
    op.create_index("ix_orders_platform", "orders", ["platform"])

    op.drop_index("ix_orders_user_tg_id", table_name="orders")
    op.drop_column("orders", "user_tg_id")

    # Sketch Requests
    op.add_column("sketch_requests", sa.Column("external_user_id", sa.String(length=100), nullable=True))
    op.add_column("sketch_requests", sa.Column("platform", sa.String(length=20), server_default="tg", nullable=False))

    op.execute("UPDATE sketch_requests SET external_user_id = user_tg_id::text")

    op.alter_column("sketch_requests", "external_user_id", nullable=False)
    op.create_index("ix_sketch_requests_external_user_id", "sketch_requests", ["external_user_id"])
    op.create_index("ix_sketch_requests_platform", "sketch_requests", ["platform"])

    op.drop_index("ix_sketch_requests_user_tg_id", table_name="sketch_requests")
    op.drop_column("sketch_requests", "user_tg_id")

    # Repeat Requests
    op.add_column("repeat_requests", sa.Column("external_user_id", sa.String(length=100), nullable=True))
    op.add_column("repeat_requests", sa.Column("platform", sa.String(length=20), server_default="tg", nullable=False))

    op.execute("UPDATE repeat_requests SET external_user_id = user_tg_id::text")

    op.alter_column("repeat_requests", "external_user_id", nullable=False)
    op.create_index("ix_repeat_requests_external_user_id", "repeat_requests", ["external_user_id"])
    op.create_index("ix_repeat_requests_platform", "repeat_requests", ["platform"])

    op.drop_index("ix_repeat_requests_user_tg_id", table_name="repeat_requests")
    op.drop_column("repeat_requests", "user_tg_id")


def downgrade():
    # Repeat Requests
    op.add_column("repeat_requests", sa.Column("user_tg_id", sa.BigInteger(), nullable=True))
    op.execute("UPDATE repeat_requests SET user_tg_id = external_user_id::bigint WHERE platform = 'tg'")
    op.create_index("ix_repeat_requests_user_tg_id", "repeat_requests", ["user_tg_id"])
    op.drop_index("ix_repeat_requests_platform", table_name="repeat_requests")
    op.drop_index("ix_repeat_requests_external_user_id", table_name="repeat_requests")
    op.drop_column("repeat_requests", "platform")
    op.drop_column("repeat_requests", "external_user_id")

    # Sketch Requests
    op.add_column("sketch_requests", sa.Column("user_tg_id", sa.BigInteger(), nullable=True))
    op.execute("UPDATE sketch_requests SET user_tg_id = external_user_id::bigint WHERE platform = 'tg'")
    op.create_index("ix_sketch_requests_user_tg_id", "sketch_requests", ["user_tg_id"])
    op.drop_index("ix_sketch_requests_platform", table_name="sketch_requests")
    op.drop_index("ix_sketch_requests_external_user_id", table_name="sketch_requests")
    op.drop_column("sketch_requests", "platform")
    op.drop_column("sketch_requests", "external_user_id")

    # Orders
    op.add_column("orders", sa.Column("user_tg_id", sa.BigInteger(), nullable=True))
    op.execute("UPDATE orders SET user_tg_id = external_user_id::bigint WHERE platform = 'tg'")
    op.create_index("ix_orders_user_tg_id", "orders", ["user_tg_id"])
    op.drop_index("ix_orders_platform", table_name="orders")
    op.drop_index("ix_orders_external_user_id", table_name="orders")
    op.drop_column("orders", "platform")
    op.drop_column("orders", "external_user_id")
