"""add phone field to users table

Revision ID: 001_add_phone_to_users
Revises: 
Create Date: 2026-05-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_add_phone_to_users'
down_revision: Union[str, None] = '475e9da7ba67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Column already applied in initial DB setup — no-op
    pass


def downgrade() -> None:
    pass
