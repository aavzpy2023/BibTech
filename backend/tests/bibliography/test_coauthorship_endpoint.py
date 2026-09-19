import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(BACKEND_DIR / "src") not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR / "src"))

try:
    from src.database.models.core import Article, Project, ProjectArticle, Base
    from src.database.models.identity import Author, AuthorArticle
    from src.database.session import get_db
    from src.bibliography.router import router
except ImportError:
    from database.models.core import Article, Project, ProjectArticle, Base
    from database.models.identity import Author, AuthorArticle
    from database.session import get_db
    from bibliography.router import router

@pytest.fixture
def in_memory_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(in_memory_db):
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router, prefix="/api/bibliography")
    app.dependency_overrides[get_db] = lambda: in_memory_db
    return TestClient(app)

def test_get_coauthorship_network_extracts_real_authors(client, in_memory_db):
    alice = Author(name="Alice Smith")
    bob = Author(name="Bob Jones")
    charlie = Author(name="Charlie Brown")
    in_memory_db.add_all([alice, bob, charlie])
    in_memory_db.commit()

    art1 = Article(
        title="Paper A",
        year="2021",
        times_cited=50
    )
    art2 = Article(
        title="Paper B",
        year="2022",
        times_cited=20
    )
    in_memory_db.add_all([art1, art2])
    in_memory_db.commit()

    aa1 = AuthorArticle(
        article_id=art1.id, author_id=alice.id, author_order=1
    )
    aa2 = AuthorArticle(
        article_id=art1.id, author_id=bob.id, author_order=2
    )
    aa3 = AuthorArticle(
        article_id=art2.id, author_id=bob.id, author_order=1
    )
    aa4 = AuthorArticle(
        article_id=art2.id, author_id=charlie.id, author_order=2
    )
    in_memory_db.add_all([aa1, aa2, aa3, aa4])
    in_memory_db.commit()

    response = client.get("/api/bibliography/network/co-authorship")
    assert response.status_code == 200
    data = response.json()

    assert "nodes" in data
    assert "links" in data
    assert "clusters" in data

    author_names = [n["name"] for n in data["nodes"]]
    assert "Bob Jones" in author_names
    assert "Alice Smith" in author_names
    assert "Charlie Brown" in author_names

    # Bob Jones co-authored with both Alice and Charlie
    bob_node = next(n for n in data["nodes"] if n["name"] == "Bob Jones")
    assert bob_node["papers"] == 2
    assert bob_node["citations"] == 70
    assert len(data["links"]) >= 2