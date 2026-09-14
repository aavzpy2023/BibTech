"""Hexagonal zero-I/O tests for Extended Tracking Models."""
import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.database.models.core import Article, Project
from src.database.models.tracking import Download, Funding, Reference
from src.database.session import Base


class TestTrackingModels(unittest.TestCase):
    """Validates Reference, Funding, and Download schemas and relationships."""

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

    def test_tracking_relationships(self) -> None:
        """Verify Article and Project links to Reference, Funding, Download."""
        article = Article(
            doi="10.1000/182",
            title="Sample Article on Quantum Optics",
            journal="Physical Review",
        )
        project = Project(
            name="Quantum Computing Project",
            description="Analysis of quantum research papers",
        )
        self.session.add_all([article, project])
        self.session.commit()

        ref = Reference(
            article_id=article.id,
            raw_citation="Einstein, Podolsky, Rosen (1935)",
            doi="10.1103/PhysRev.47.777",
            title="Can Quantum-Mechanical Description of Physical Reality...",
            year=1935,
        )
        funding = Funding(
            article_id=article.id,
            agency="National Science Foundation",
            grant_number="NSF-PHY-2026",
            country="USA",
        )
        download = Download(
            article_id=article.id,
            project_id=project.id,
            source="unpaywall",
            file_path="/storage/pdf/quantum_optics.pdf",
            file_size_bytes=1048576,
            status="completed",
        )
        self.session.add_all([ref, funding, download])
        self.session.commit()

        # Query and verify article traversal
        queried_article = (
            self.session.query(Article).filter_by(doi="10.1000/182").one()
        )
        self.assertEqual(len(queried_article.references), 1)
        self.assertEqual(
            queried_article.references[0].doi, "10.1103/PhysRev.47.777"
        )
        self.assertEqual(len(queried_article.funding), 1)
        self.assertEqual(
            queried_article.funding[0].grant_number, "NSF-PHY-2026"
        )
        self.assertEqual(len(queried_article.downloads), 1)
        self.assertEqual(
            queried_article.downloads[0].source, "unpaywall"
        )
        self.assertEqual(
            queried_article.downloads[0].project.name,
            "Quantum Computing Project",
        )

        # Query and verify project traversal
        queried_project = (
            self.session.query(Project)
            .filter_by(name="Quantum Computing Project")
            .one()
        )
        self.assertEqual(len(queried_project.downloads), 1)
        self.assertEqual(
            queried_project.downloads[0].article.doi, "10.1000/182"
        )

    def test_semantic_comments_present_on_all_tracking_columns(self) -> None:
        """Enforce Semantic Primacy: every column must contain a comment."""
        models = [Reference, Funding, Download]
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