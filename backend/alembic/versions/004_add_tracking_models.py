"""Add tracking models

Revision ID: 004_add_tracking_models
Revises: 003_add_keywords
Create Date: 2026-09-14 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "004_add_tracking_models"
down_revision: Union[str, None] = "003_add_keywords"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "references",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for reference",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to the referencing article",
        ),
        sa.Column(
            "raw_citation",
            sa.Text(),
            nullable=False,
            comment=(
                "Full text or formatted citation string of the reference"
            ),
        ),
        sa.Column(
            "doi",
            sa.String(length=255),
            nullable=True,
            comment="Extracted or resolved DOI for cited reference",
        ),
        sa.Column(
            "title",
            sa.Text(),
            nullable=True,
            comment="Title of the cited reference",
        ),
        sa.Column(
            "year",
            sa.Integer(),
            nullable=True,
            comment="Publication year of the cited reference",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when reference was extracted",
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_references_doi"), "references", ["doi"], unique=False
    )
    op.create_table(
        "funding",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for funding record",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to funded article",
        ),
        sa.Column(
            "agency",
            sa.String(length=255),
            nullable=False,
            comment="Name of funding agency or institution",
        ),
        sa.Column(
            "grant_number",
            sa.String(length=100),
            nullable=True,
            comment="Specific grant or award identification number",
        ),
        sa.Column(
            "country",
            sa.String(length=100),
            nullable=True,
            comment="Country of funding organization",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when funding record was created",
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "downloads",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key identifier for download record",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to downloaded article",
        ),
        sa.Column(
            "project_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to parent project",
        ),
        sa.Column(
            "source",
            sa.String(length=100),
            nullable=False,
            comment="Download source or resolver (e.g. unpaywall, openalex)",
        ),
        sa.Column(
            "file_path",
            sa.String(length=500),
            nullable=True,
            comment="Local or cloud storage path of downloaded PDF",
        ),
        sa.Column(
            "file_size_bytes",
            sa.Integer(),
            nullable=True,
            comment="Size of downloaded file in bytes",
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            comment="Download status (e.g. completed, failed, in_progress)",
        ),
        sa.Column(
            "downloaded_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when download occurred",
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("downloads")
    op.drop_table("funding")
    op.drop_index(op.f("ix_references_doi"), table_name="references")
    op.drop_table("references")