"""add is_suspended to sellers

Revision ID: 003_add_is_suspended_to_sellers
Revises: 475e9da7ba67
Create Date: 2026-06-17

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_add_is_suspended_to_sellers'
down_revision: Union[str, None] = '159a94613d0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'sellers',
        sa.Column('is_suspended', sa.Boolean(), nullable=False, server_default='false'),
    )


def downgrade() -> None:
    op.drop_column('sellers', 'is_suspended')
