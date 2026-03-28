"""add old_price_rub to products

Revision ID: 0002_product_old_price
Revises: 0001_init
Create Date: 2026-03-27

"""
from alembic import op
import sqlalchemy as sa

revision = "0002_product_old_price"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("products", sa.Column("old_price_rub", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("products", "old_price_rub")
