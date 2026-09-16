"""Hexagonal zero-I/O tests for Identity Domain Models (Authors & Affiliations)."""
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

from src.database.models.core import Article
from src.database.models.identity import (
    Affiliation,
    Author,
    AuthorArticle,
    Keyword,
    KeywordArticle,
)
from src.database.session import Base


class TestIdentityModels(unittest.TestCase):
    """Validates Affiliation, Author, and AuthorArticle schema and relationships."""

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

    def test_author_affiliation_and_article_m2m(self) -> None:
        """Verify navigation: article.authors[0].affiliation.institution."""
        affiliation = Affiliation(
            institution="Stanford University",
            department="Computer Science",
            country="USA",
        )
        self.session.add(affiliation)
        self.session.commit()

        author = Author(
            name="John Doe",
            orcid="0000-0002-1825-0097",
            email="johndoe@stanford.edu",
            affiliation_id=affiliation.id,
        )
        article = Article(
            doi="10.1000/182",
            title="Foundations of AI",
            journal="Science",
        )
        self.session.add_all([author, article])
        self.session.commit()

        link = AuthorArticle(
            author_id=author.id,
            article_id=article.id,
            author_order=1,
            is_corresponding=True,
        )
        self.session.add(link)
        self.session.commit()

        # Query Article and explicitly assert author affiliation matches
        queried_article = (
            self.session.query(Article).filter_by(doi="10.1000/182").one()
        )
        self.assertEqual(len(queried_article.authors), 1)
        self.assertEqual(
            queried_article.authors[0].affiliation.institution,
            "Stanford University",
        )
        self.assertEqual(
            queried_article.author_articles[0].author_order,
            1,
        )
        self.assertTrue(queried_article.author_articles[0].is_corresponding)

        # Reverse traversal
        self.assertEqual(len(author.articles), 1)
        self.assertEqual(author.articles[0].title, "Foundations of AI")

    def test_keyword_article_m2m(self) -> None:
        """Verify Keyword creation and linkage to Article."""
        article = Article(
            doi="10.1000/keyword-test",
            title="Transformer Architectures",
            journal="arXiv",
        )
        keyword = Keyword(
            name="deep learning",
            type="author",
        )
        self.session.add_all([article, keyword])
        self.session.commit()

        link = KeywordArticle(
            keyword_id=keyword.id,
            article_id=article.id,
        )
        self.session.add(link)
        self.session.commit()

        queried = (
            self.session.query(Article)
            .filter_by(doi="10.1000/keyword-test")
            .one()
        )
        self.assertGreater(len(queried.keywords), 0)
        self.assertEqual(queried.keywords[0].name, "deep learning")
        self.assertEqual(queried.keywords[0].type, "author")
        self.assertEqual(len(keyword.articles), 1)
        self.assertEqual(
            keyword.articles[0].title, "Transformer Architectures"
        )

    def test_semantic_comments_present_on_all_identity_columns(self) -> None:
        """Enforce Semantic Primacy: every column must contain a comment."""
        models = [
            Affiliation,
            Author,
            AuthorArticle,
            Keyword,
            KeywordArticle,
        ]
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