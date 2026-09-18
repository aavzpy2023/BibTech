"""deprecate_legacy_references_table

Revision ID: 008
Revises: 007
Create Date: 2026-09-18 18:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Safely archive legacy table adhering to Rule 4 (Zero Data Loss / Rename)
    op.rename_table('references', 'legacy_references_deprecated')


def downgrade() -> None:
    op.rename_table('legacy_references_deprecated', 'references')