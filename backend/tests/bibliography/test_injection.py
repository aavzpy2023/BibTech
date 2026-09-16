"""Unit tests for bibliography injection repository and service."""
import sys
from datetime import datetime, timezone
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from src.bibliography.injection_service import inject_references_to_db
    from src.bibliography.schemas import ParsedReference
    from src.database.models import core, identity, tracking
    from src.database.models.core import Article, Project, ProjectArticle
    from src.database.session import Base
except ImportError:
    from backend.src.bibliography.injection_service import (
        inject_references_to_db,
    )
    from backend.src.bibliography.schemas import ParsedReference
    from backend.src.database.models import core, identity, tracking
    from backend.src.database.models.core import (
        Article,
        Project,
        ProjectArticle,
    )
    from backend.src.database.session import Base


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


def test_inject_references_to_db_success(in_memory_db):
    now = datetime.now(timezone.utc)
    mock_refs = [
        ParsedReference(
            title="Deep Residual Learning for Image Recognition",
            author="He, K. and Zhang, X.",
            year="2016",
            journal="CVPR",
            upload_datetime=now,
        ),
        ParsedReference(
            title="Attention Is All You Need",
            author="Vaswani, A. and Shazeer, N.",
            year="2017",
            journal="NeurIPS",
            upload_datetime=now,
        ),
    ]

    inserted = inject_references_to_db(in_memory_db, mock_refs, "TEST-PROJ")

    assert inserted == 2
    proj = (
        in_memory_db.query(Project)
        .filter(Project.name == "TEST-PROJ")
        .first()
    )
    assert proj is not None
    assert proj.name == "TEST-PROJ"

    articles = in_memory_db.query(Article).all()
    assert len(articles) == 2
    titles = [a.title for a in articles]
    assert "Deep Residual Learning for Image Recognition" in titles
    assert "Attention Is All You Need" in titles

    links = in_memory_db.query(ProjectArticle).all()
    assert len(links) == 2
    for link in links:
        assert link.project_id == proj.id


def test_inject_references_reuses_existing_project(in_memory_db):
    now = datetime.now(timezone.utc)
    ref_batch_1 = [
        ParsedReference(
            title="Paper One",
            author="Author One",
            year="2020",
            journal="Journal A",
            upload_datetime=now,
        )
    ]
    ref_batch_2 = [
        ParsedReference(
            title="Paper Two",
            author="Author Two",
            year="2021",
            journal="Journal B",
            upload_datetime=now,
        )
    ]

    count1 = inject_references_to_db(in_memory_db, ref_batch_1, "REUSE-PROJ")
    count2 = inject_references_to_db(in_memory_db, ref_batch_2, "REUSE-PROJ")

    assert count1 == 1
    assert count2 == 1
    projects = (
        in_memory_db.query(Project)
        .filter(Project.name == "REUSE-PROJ")
        .all()
    )
    assert len(projects) == 1

    links = in_memory_db.query(ProjectArticle).all()
    assert len(links) == 2


def test_inject_references_with_optional_and_invalid_fields(in_memory_db):
    now = datetime.now(timezone.utc)
    refs = [
        ParsedReference(
            title="Missing Year Paper",
            author=None,
            year=None,
            journal=None,
            upload_datetime=now,
        ),
        ParsedReference(
            title="String Year Paper",
            author="Author",
            year="invalid_year",
            journal="Journal C",
            upload_datetime=now,
        ),
    ]

    inserted = inject_references_to_db(in_memory_db, refs, "OPT-PROJ")
    assert inserted == 2

    article_none = (
        in_memory_db.query(Article)
        .filter(Article.title == "Missing Year Paper")
        .first()
    )
    assert article_none is not None
    assert article_none.year is None

    article_inv = (
        in_memory_db.query(Article)
        .filter(Article.title == "String Year Paper")
        .first()
    )
    assert article_inv is not None
    assert article_inv.year is None


def test_inject_references_empty_list(in_memory_db):
    inserted = inject_references_to_db(in_memory_db, [], "EMPTY-PROJ")
    assert inserted == 0
    proj = (
        in_memory_db.query(Project)
        .filter(Project.name == "EMPTY-PROJ")
        .first()
    )
    assert proj is not None


def test_models_and_router_imports_resolve_without_src_package():
    import importlib
    models_pkg = importlib.import_module("backend.src.database.models")
    assert hasattr(models_pkg, "Article")
    assert hasattr(models_pkg, "Project")
    assert hasattr(models_pkg, "ProjectArticle")


def test_inject_references_db_operational_error():
    from sqlalchemy.exc import OperationalError
    from unittest.mock import MagicMock

    now = datetime.now(timezone.utc)
    mock_refs = [ParsedReference(title="Test", upload_datetime=now)]
    
    mock_db = MagicMock()
    mock_db.query.side_effect = OperationalError("mock", "mock", "mock")
    
    with pytest.raises(RuntimeError, match="Database connection failed"):
        inject_references_to_db(mock_db, mock_refs, "ERR-PROJ")


def test_inject_references_deduplicates_within_batch(in_memory_db):
    now = datetime.now(timezone.utc)
    dup_refs = [
        ParsedReference(
            title="Duplicate Paper",
            doi="10.1000/dup",
            upload_datetime=now,
        ),
        ParsedReference(
            title="Duplicate Paper",
            doi="10.1000/dup",
            upload_datetime=now,
        ),
    ]
    inserted = inject_references_to_db(in_memory_db, dup_refs, "DUP-PROJ")
    assert inserted == 1
    articles = (
        in_memory_db.query(Article)
        .filter(Article.doi == "10.1000/dup")
        .all()
    )
    assert len(articles) == 1