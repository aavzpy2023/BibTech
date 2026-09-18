"""add_source_database_dimension

Revision ID: 007
Revises: 006
Create Date: 2026-09-18 17:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create source_databases table
    op.create_table(
        'source_databases',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_source_databases_name'),
        'source_databases',
        ['name'],
        unique=True
    )

    # 2. Seed data exactly as specified (Immutable Dimension)
    source_databases_table = table(
        'source_databases',
        column('id', sa.Integer),
        column('name', sa.String),
        column('description', sa.String)
    )

    op.bulk_insert(
        source_databases_table,
        [
            {'id': 1, 'name': 'Web of Science', 'description': 'Multidisciplinaria'},
            {'id': 2, 'name': 'Scopus', 'description': 'Multidisciplinaria'},
            {'id': 3, 'name': 'PubMed', 'description': 'Ciencias de la salud'},
            {'id': 4, 'name': 'Crossref', 'description': 'Agencia de registro DOI'},
            {'id': 5, 'name': 'Google Scholar', 'description': 'Multidisciplinaria, cobertura más amplia'},
            {'id': 6, 'name': 'Embase', 'description': 'Biomedicina, farmacología, salud pública'},
            {'id': 7, 'name': 'CINAHL', 'description': 'Enfermería y ciencias de la salud afines'},
            {'id': 8, 'name': 'PsycINFO', 'description': 'Psicología y ciencias del comportamiento'},
            {'id': 9, 'name': 'ERIC', 'description': 'Educación'},
            {'id': 10, 'name': 'IEEE Xplore', 'description': 'Ingeniería, computación, electrónica'},
            {'id': 11, 'name': 'JSTOR', 'description': 'Humanidades, ciencias sociales, ciencias'},
            {'id': 12, 'name': 'Cochrane Library', 'description': 'Revisiones sistemáticas en salud'},
            {'id': 13, 'name': 'OpenAlex', 'description': 'Multidisciplinaria, abierta'},
            {'id': 14, 'name': 'Semantic Scholar', 'description': 'Multidisciplinaria, con IA, gratis'},
            {'id': 15, 'name': 'LILACS', 'description': 'Salud, América Latina y el Caribe'},
            {'id': 16, 'name': 'SciELO', 'description': 'Multidisciplinaria, América Latina'}
        ]
    )

    # 3. Alter articles table to include the foreign key
    op.add_column(
        'articles',
        sa.Column('source_database_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_articles_source_database_id',
        'articles',
        'source_databases',
        ['source_database_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Downgrade omitted to prevent data destruction
    pass