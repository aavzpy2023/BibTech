"""Add article extended metadata and expand string columns to text

Revision ID: 005_add_article_metadata
Revises: 004_add_tracking_models
Create Date: 2026-09-16 11:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "005_add_article_metadata"
down_revision: Union[str, None] = "004_add_tracking_models"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Expand historical VARCHAR(50) columns from 001 to TEXT to prevent StringDataRightTruncation
    op.alter_column(
        "articles",
        "volume",
        existing_type=sa.String(length=50),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "articles",
        "issue",
        existing_type=sa.String(length=50),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "articles",
        "pages",
        existing_type=sa.String(length=50),
        type_=sa.Text(),
        existing_nullable=True,
    )

    # 2. Add extended bibliographic metadata columns with production-safe types
    op.add_column(
        "articles",
        sa.Column(
            "publisher",
            sa.String(length=255),
            nullable=True,
            comment="Publisher or imprint name of the article",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "language",
            sa.Text(),
            nullable=True,
            comment="Primary language of the publication",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "research_areas",
            sa.Text(),
            nullable=True,
            comment="Research areas or Web of Science categories",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "web_of_science_categories",
            sa.Text(),
            nullable=True,
            comment="Specific Web of Science categorical metadata",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "funding_text",
            sa.Text(),
            nullable=True,
            comment="Funding acknowledgment text or grant information",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "journal_iso",
            sa.String(length=255),
            nullable=True,
            comment="ISO abbreviation of the journal name",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "oa_status",
            sa.Text(),
            nullable=True,
            comment="Open Access status indicator",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "issn",
            sa.Text(),
            nullable=True,
            comment="International Standard Serial Number",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "times_cited",
            sa.Integer(),
            nullable=True,
            comment="Number of times the article has been cited globally",
        ),
    )
    op.add_column(
        "articles",
        sa.Column(
            "cited_references_count",
            sa.Integer(),
            nullable=True,
            comment="Number of references cited by this article",
        ),
    )


def downgrade() -> None:
    op.drop_column("articles", "cited_references_count")
    op.drop_column("articles", "times_cited")
    op.drop_column("articles", "issn")
    op.drop_column("articles", "oa_status")
    op.drop_column("articles", "journal_iso")
    op.drop_column("articles", "funding_text")
    op.drop_column("articles", "web_of_science_categories")
    op.drop_column("articles", "research_areas")
    op.drop_column("articles", "language")
    op.drop_column("articles", "publisher")

    op.alter_column(
        "articles",
        "pages",
        existing_type=sa.Text(),
        type_=sa.String(length=50),
        existing_nullable=True,
    )
    op.alter_column(
        "articles",
        "issue",
        existing_type=sa.Text(),
        type_=sa.String(length=50),
        existing_nullable=True,
    )
    op.alter_column(
        "articles",
        "volume",
        existing_type=sa.Text(),
        type_=sa.String(length=50),
        existing_nullable=True,
    )