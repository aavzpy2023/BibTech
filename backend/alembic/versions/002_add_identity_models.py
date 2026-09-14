"""Add identity models

Revision ID: 002_add_identity_models
Revises: 001_add_core_models
Create Date: 2026-09-14 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002_add_identity_models"
down_revision: Union[str, None] = "001_add_core_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "affiliations",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for affiliation",
        ),
        sa.Column(
            "institution",
            sa.String(length=255),
            nullable=False,
            comment="Institution or organization name",
        ),
        sa.Column(
            "department",
            sa.String(length=255),
            nullable=True,
            comment="Academic department or laboratory division",
        ),
        sa.Column(
            "country",
            sa.String(length=100),
            nullable=True,
            comment="Country location of the institution",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when affiliation was created",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "authors",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for author",
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
            comment="Full name of the author or researcher",
        ),
        sa.Column(
            "orcid",
            sa.String(length=50),
            nullable=True,
            comment="Author's ORCID identifier",
        ),
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
            comment="Contact email address for the author",
        ),
        sa.Column(
            "affiliation_id",
            sa.Integer(),
            nullable=True,
            comment="Foreign key linking to affiliations.id",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when author record was created",
        ),
        sa.ForeignKeyConstraint(
            ["affiliation_id"], ["affiliations.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_authors_orcid"), "authors", ["orcid"], unique=False)
    op.create_table(
        "author_articles",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key junction identifier",
        ),
        sa.Column(
            "author_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to authors.id",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to articles.id",
        ),
        sa.Column(
            "author_order",
            sa.Integer(),
            nullable=False,
            comment="Order of authorship in the publication (1-based)",
        ),
        sa.Column(
            "is_corresponding",
            sa.Boolean(),
            nullable=False,
            comment="Flag indicating if this author is the corresponding author",
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["author_id"], ["authors.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "author_id", "article_id", name="uq_author_article"
        ),
    )


def downgrade() -> None:
    op.drop_table("author_articles")
    op.drop_index(op.f("ix_authors_orcid"), table_name="authors")
    op.drop_table("authors")
    op.drop_table("affiliations")