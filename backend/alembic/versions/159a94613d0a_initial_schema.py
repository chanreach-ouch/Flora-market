"""Initial schema

Revision ID: 159a94613d0a
Revises: 
Create Date: 2026-05-24 15:05:03.204607

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '159a94613d0a'
down_revision: Union[str, Sequence[str], None] = '001_add_phone_to_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Schema already applied via 475e9da7ba67 — no-op
    pass
    return
    op.create_table('users',
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=True),
    sa.Column('role', sa.Enum('super_admin', 'admin', 'manager', 'customer', 'seller', name='userrole'), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('sellers',
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('nursery_name', sa.String(length=255), nullable=False),
    sa.Column('nursery_name_kh', sa.String(length=255), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('description_kh', sa.String(), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.Column('district', sa.String(), nullable=True),
    sa.Column('city', sa.String(), nullable=True),
    sa.Column('cover_photo', sa.String(), nullable=True),
    sa.Column('avatar', sa.String(), nullable=True),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.Column('rating', sa.Float(), nullable=False),
    sa.Column('total_orders', sa.Integer(), nullable=False),
    sa.Column('total_plants', sa.Integer(), nullable=False),
    sa.Column('year_joined', sa.Integer(), nullable=True),
    sa.Column('specialties', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('specialties_kh', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sellers_id'), 'sellers', ['id'], unique=False)
    op.create_index(op.f('ix_sellers_nursery_name'), 'sellers', ['nursery_name'], unique=False)
    op.create_index(op.f('ix_sellers_user_id'), 'sellers', ['user_id'], unique=True)
    op.create_table('orders',
    sa.Column('buyer_id', sa.String(), nullable=False),
    sa.Column('seller_id', sa.String(), nullable=False),
    sa.Column('total_amount', sa.Float(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'preparing', 'completed', 'cancelled', name='orderstatus'), nullable=False),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['seller_id'], ['sellers.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_orders_buyer_id'), 'orders', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
    op.create_index(op.f('ix_orders_seller_id'), 'orders', ['seller_id'], unique=False)
    op.create_table('plants',
    sa.Column('seller_id', sa.String(), nullable=False),
    sa.Column('name_en', sa.String(length=255), nullable=False),
    sa.Column('name_kh', sa.String(length=255), nullable=False),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('stock', sa.Integer(), nullable=False),
    sa.Column('tagline', sa.String(), nullable=True),
    sa.Column('tagline_kh', sa.String(), nullable=True),
    sa.Column('images', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('pros', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('pros_kh', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('cons', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('cons_kh', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('water_freq', sa.String(), nullable=True),
    sa.Column('water_freq_kh', sa.String(), nullable=True),
    sa.Column('light_req', sa.String(), nullable=True),
    sa.Column('light_req_kh', sa.String(), nullable=True),
    sa.Column('temp_range', sa.String(), nullable=True),
    sa.Column('difficulty', sa.String(), nullable=True),
    sa.Column('difficulty_kh', sa.String(), nullable=True),
    sa.Column('total_sold', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Float(), nullable=False),
    sa.Column('review_count', sa.Integer(), nullable=False),
    sa.Column('is_new', sa.Boolean(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['seller_id'], ['sellers.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_plants_category'), 'plants', ['category'], unique=False)
    op.create_index(op.f('ix_plants_id'), 'plants', ['id'], unique=False)
    op.create_index(op.f('ix_plants_name_en'), 'plants', ['name_en'], unique=False)
    op.create_index(op.f('ix_plants_name_kh'), 'plants', ['name_kh'], unique=False)
    op.create_index(op.f('ix_plants_seller_id'), 'plants', ['seller_id'], unique=False)
    op.create_table('order_items',
    sa.Column('order_id', sa.String(), nullable=False),
    sa.Column('plant_id', sa.String(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Float(), nullable=False),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_items_id'), 'order_items', ['id'], unique=False)
    op.create_index(op.f('ix_order_items_order_id'), 'order_items', ['order_id'], unique=False)
    op.create_index(op.f('ix_order_items_plant_id'), 'order_items', ['plant_id'], unique=False)
    op.create_table('reviews',
    sa.Column('buyer_id', sa.String(), nullable=False),
    sa.Column('seller_id', sa.String(), nullable=False),
    sa.Column('plant_id', sa.String(), nullable=False),
    sa.Column('rating', sa.Float(), nullable=False),
    sa.Column('comment', sa.String(), nullable=True),
    sa.Column('comment_kh', sa.String(), nullable=True),
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['seller_id'], ['sellers.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reviews_buyer_id'), 'reviews', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    op.create_index(op.f('ix_reviews_plant_id'), 'reviews', ['plant_id'], unique=False)
    op.create_index(op.f('ix_reviews_seller_id'), 'reviews', ['seller_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_reviews_seller_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_plant_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_buyer_id'), table_name='reviews')
    op.drop_table('reviews')
    op.drop_index(op.f('ix_order_items_plant_id'), table_name='order_items')
    op.drop_index(op.f('ix_order_items_order_id'), table_name='order_items')
    op.drop_index(op.f('ix_order_items_id'), table_name='order_items')
    op.drop_table('order_items')
    op.drop_index(op.f('ix_plants_seller_id'), table_name='plants')
    op.drop_index(op.f('ix_plants_name_kh'), table_name='plants')
    op.drop_index(op.f('ix_plants_name_en'), table_name='plants')
    op.drop_index(op.f('ix_plants_id'), table_name='plants')
    op.drop_index(op.f('ix_plants_category'), table_name='plants')
    op.drop_table('plants')
    op.drop_index(op.f('ix_orders_seller_id'), table_name='orders')
    op.drop_index(op.f('ix_orders_id'), table_name='orders')
    op.drop_index(op.f('ix_orders_buyer_id'), table_name='orders')
    op.drop_table('orders')
    op.drop_index(op.f('ix_sellers_user_id'), table_name='sellers')
    op.drop_index(op.f('ix_sellers_nursery_name'), table_name='sellers')
    op.drop_index(op.f('ix_sellers_id'), table_name='sellers')
    op.drop_table('sellers')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
