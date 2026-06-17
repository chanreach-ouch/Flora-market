"""initial schema stub (schema already applied directly)

Revision ID: 475e9da7ba67
Revises:
Create Date: 2026-06-17

"""
from typing import Sequence, Union

revision: str = '475e9da7ba67'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
