"""Add keywords

Revision ID: 003_add_keywords
Revises: 002_add_identity_models
Create Date: 2026-09-14 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "003_add_keywords"
down_revision: Union[str, None] = "002_add_identity_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "keywords",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for keyword",
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
            comment="Normalized keyword or term string",
        ),
        sa.Column(
            "type",
            sa.String(length=50),
            nullable=False,
            comment=(
                "Classification type of keyword (e.g. author, mesh, index)"
            ),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when keyword was registered",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_keywords_name"), "keywords", ["name"], unique=False
    )
    op.create_table(
        "keyword_articles",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key junction identifier",
        ),
        sa.Column(
            "keyword_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to keywords.id",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to articles.id",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when keyword was linked to article",
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["keyword_id"], ["keywords.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "keyword_id", "article_id", name="uq_keyword_article"
        ),
    )


def downgrade() -> None:
    op.drop_table("keyword_articles")
    op.drop_index(op.f("ix_keywords_name"), table_name="keywords")
    op.drop_table("keywords")