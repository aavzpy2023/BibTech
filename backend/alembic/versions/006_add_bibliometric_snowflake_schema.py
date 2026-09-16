"""add_bibliometric_snowflake_schema

Revision ID: 006
Revises: 005
Create Date: 2026-09-16 18:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create journals table
    op.create_table(
        'journals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('iso_abbreviation', sa.String(length=255), nullable=True),
        sa.Column('issn', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_journals_name'), 'journals', ['name'], unique=True)

    # Create countries table
    op.create_table(
        'countries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_countries_name'), 'countries', ['name'], unique=True)

    # Create cited_references table
    op.create_table(
        'cited_references',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('raw_string', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(length=255), nullable=True),
        sa.Column('doi', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_cited_references_raw_string'),
        'cited_references',
        ['raw_string'],
        unique=True
    )
    op.create_index(
        op.f('ix_cited_references_doi'),
        'cited_references',
        ['doi'],
        unique=False
    )

    # Create article_countries table
    op.create_table(
        'article_countries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('article_id', sa.Integer(), nullable=False),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['article_id'], ['articles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['country_id'], ['countries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('article_id', 'country_id', name='uq_article_country')
    )
    op.create_index(
        op.f('ix_article_countries_article_id'),
        'article_countries',
        ['article_id'],
        unique=False
    )
    op.create_index(
        op.f('ix_article_countries_country_id'),
        'article_countries',
        ['country_id'],
        unique=False
    )

    # Create article_citations table
    op.create_table(
        'article_citations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('article_id', sa.Integer(), nullable=False),
        sa.Column('cited_reference_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['article_id'], ['articles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['cited_reference_id'],
            ['cited_references.id'],
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'article_id',
            'cited_reference_id',
            name='uq_article_citation'
        )
    )
    op.create_index(
        op.f('ix_article_citations_article_id'),
        'article_citations',
        ['article_id'],
        unique=False
    )
    op.create_index(
        op.f('ix_article_citations_cited_reference_id'),
        'article_citations',
        ['cited_reference_id'],
        unique=False
    )

    # Add journal_id to articles
    op.add_column('articles', sa.Column('journal_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_articles_journal_id',
        'articles',
        'journals',
        ['journal_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Downgrade omitted to prevent accidental data destruction (Rule: NEVER op.drop_column)
    pass