"""Tests for database session infrastructure."""
import unittest
from unittest.mock import MagicMock, patch

from src.database.session import Base, get_db


class TestDatabaseSession(unittest.TestCase):
    """Validates database session setup and lifecycle."""

    def test_base_metadata_initialized(self) -> None:
        """Ensure Base exposes SQLAlchemy MetaData."""
        self.assertIsNotNone(Base.metadata)

    @patch("src.database.session.SessionLocal")
    def test_get_db_lifecycle(self, mock_session_local: MagicMock) -> None:
        """Ensure get_db yields session and closes it on teardown."""
        mock_session = MagicMock()
        mock_session_local.return_value = mock_session

        db_gen = get_db()
        session = next(db_gen)
        self.assertEqual(session, mock_session)

        with self.assertRaises(StopIteration):
            next(db_gen)

        mock_session.close.assert_called_once()