"""Hexagonal zero-I/O tests for Core Domain Models (Projects & Articles)."""
import unittest

import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

_backend_dir = Path(__file__).resolve().parents[2]
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
_repo_dir = Path(__file__).resolve().parents[3]
if str(_repo_dir) not in sys.path:
    sys.path.insert(0, str(_repo_dir))

try:
    from src.database.models.core import Article, Project, ProjectArticle
    from src.database.session import Base
except ImportError:
    from backend.src.database.models.core import (
        Article,
        Project,
        ProjectArticle,
    )
    from backend.src.database.session import Base


class TestCoreModels(unittest.TestCase):
    """Validates Project, Article, and ProjectArticle schema and relationships."""

    def setUp(self) -> None:
        """Initialize in-memory SQLite engine and tables for zero-I/O testing."""
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.session: Session = self.SessionLocal()

    def tearDown(self) -> None:
        """Clean up in-memory session and tables."""
        self.session.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_create_project_and_article_m2m(self) -> None:
        """Verify bidirectional relationship between Project and Article."""
        project = Project(
            name="Deep Learning Survey",
            description="Investigation on Transformers",
            hashed_password="mocked_bcrypt_hash_12345",
        )
        article = Article(
            doi="10.1000/182",
            title="Attention Is All You Need",
            journal="NeurIPS",
            year=2017,
            volume="30",
            pages="5998-6008",
            abstract="The dominant sequence transduction models...",
        )
        self.session.add_all([project, article])
        self.session.commit()

        link = ProjectArticle(
            project_id=project.id,
            article_id=article.id,
            status="pending",
        )
        self.session.add(link)
        self.session.commit()

        self.session.refresh(project)
        self.session.refresh(article)

        self.assertEqual(len(project.project_articles), 1)
        self.assertEqual(
            project.project_articles[0].article.doi, "10.1000/182"
        )
        self.assertEqual(len(project.articles), 1)
        self.assertEqual(
            project.articles[0].title, "Attention Is All You Need"
        )

        self.assertEqual(len(article.project_articles), 1)
        self.assertEqual(
            article.project_articles[0].project.hashed_password,
            "mocked_bcrypt_hash_12345",
        )
        self.assertEqual(len(article.projects), 1)
        self.assertEqual(article.projects[0].name, "Deep Learning Survey")

    def test_article_extended_metadata_persistence(self) -> None:
        """Verify that newly added extended .bib metadata fields persist correctly."""
        article = Article(
            title="Extended Metadata Paper",
            abstract="A novel approach to metadata.",
            publisher="Tech Press",
            language="English",
            keywords="metadata; bibliography; parsing",
            research_areas="Computer Science",
            web_of_science_categories="Computer Science, Information Systems",
            funding_text="Supported by AI Grant 2026",
            journal_iso="J. Tech. Press",
            oa_status="Gold",
            doi="10.1000/extended",
            issn="1234-5678",
            times_cited=42,
            cited_references_count=10,
        )
        self.session.add(article)
        self.session.commit()
        self.session.refresh(article)

        self.assertEqual(article.publisher, "Tech Press")
        self.assertEqual(article.times_cited, 42)
        self.assertEqual(article.language, "English")
        self.assertEqual(article.oa_status, "Gold")

    def test_semantic_comments_present_on_all_columns(self) -> None:
        """Enforce Semantic Primacy: every column must contain a comment."""
        models = [Project, Article, ProjectArticle]
        for model in models:
            for col in model.__table__.columns:
                self.assertIsNotNone(
                    col.comment,
                    f"Column '{col.name}' in '{model.__tablename__}' lacks comment",
                )
                self.assertTrue(
                    len(col.comment.strip()) > 0,
                    f"Comment on '{col.name}' in '{model.__tablename__}' is empty",
                )