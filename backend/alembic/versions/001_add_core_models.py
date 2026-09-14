"""Add core models

Revision ID: 001_add_core_models
Revises:
Create Date: 2026-09-14 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_add_core_models"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key integer identifier",
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
            comment="Project display and reference name",
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
            comment="Detailed description of the project",
        ),
        sa.Column(
            "hashed_password",
            sa.String(length=255),
            nullable=True,
            comment="Bcrypt hashed project password",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when the project was created",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when the project was last updated",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "articles",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key integer identifier",
        ),
        sa.Column(
            "doi",
            sa.String(length=255),
            nullable=True,
            comment="Normalized DOI unique key",
        ),
        sa.Column(
            "title",
            sa.Text(),
            nullable=False,
            comment="Full title of the article or publication",
        ),
        sa.Column(
            "journal",
            sa.String(length=255),
            nullable=True,
            comment="Journal or venue publishing the article",
        ),
        sa.Column(
            "year",
            sa.Integer(),
            nullable=True,
            comment="Publication calendar year",
        ),
        sa.Column(
            "volume",
            sa.String(length=50),
            nullable=True,
            comment="Journal publication volume",
        ),
        sa.Column(
            "issue",
            sa.String(length=50),
            nullable=True,
            comment="Journal publication issue",
        ),
        sa.Column(
            "pages",
            sa.String(length=50),
            nullable=True,
            comment="Article page range or article number",
        ),
        sa.Column(
            "abstract",
            sa.Text(),
            nullable=True,
            comment="Full text abstract of the article",
        ),
        sa.Column(
            "raw_data",
            sa.Text(),
            nullable=True,
            comment="Raw bibliographic payload (e.g. BibTeX or RIS)",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when article was ingested",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            comment="UTC timestamp when article record was updated",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_articles_doi"), "articles", ["doi"], unique=True)
    op.create_table(
        "project_articles",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="Primary key junction identifier",
        ),
        sa.Column(
            "project_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to projects.id",
        ),
        sa.Column(
            "article_id",
            sa.Integer(),
            nullable=False,
            comment="Foreign key linking to articles.id",
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            comment=(
                "Processing or download status of the article in the project"
            ),
        ),
        sa.Column(
            "added_at",
            sa.DateTime(),
            nullable=False,
            comment=(
                "UTC timestamp when article was associated with project"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "project_id", "article_id", name="uq_project_article"
        ),
    )


def downgrade() -> None:
    op.drop_table("project_articles")
    op.drop_index(op.f("ix_articles_doi"), table_name="articles")
    op.drop_table("articles")
    op.drop_table("projects")