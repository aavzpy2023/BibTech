import sys
from pathlib import Path
from io import BytesIO
import asyncio
from unittest.mock import patch, MagicMock, mock_open
from datetime import datetime, timezone
import pytest

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from fastapi import UploadFile, HTTPException
from backend.main import app
from backend.src.bibliography.schemas import ParsedReference

try:
    from fastapi.testclient import TestClient
    client = TestClient(app)
    HAS_TESTCLIENT = True
except (RuntimeError, ImportError):
    client = None
    HAS_TESTCLIENT = False

from backend.src.bibliography.router import (
    upload_bibliography,
    batch_download,
    download_zip,
    inject_bibliography,
)
from backend.src.bibliography.schemas import (
    BatchDownloadRequest,
    ZipDownloadRequest,
    LocalBatchDownloadRequest,
)

def test_upload_bibliography_direct_success():
    mock_ref = ParsedReference(
        author="Test Author",
        year="2024",
        title="Test Title",
        journal="Test Journal",
        upload_datetime=datetime(2024, 1, 1, tzinfo=timezone.utc)
    )
    with patch(
        "backend.src.bibliography.router.parse_bibliography_content",
        return_value=[mock_ref]
    ):
        file = UploadFile(
            filename="test.bib",
            file=BytesIO(b"fake bib content")
        )
        result = asyncio.run(upload_bibliography(file))
        assert len(result) == 1
        assert result[0].title == "Test Title"

def test_upload_bibliography_direct_invalid_extension():
    file = UploadFile(
        filename="test.ris",
        file=BytesIO(b"fake ris content")
    )
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(upload_bibliography(file))
    assert exc_info.value.status_code == 400
    assert "Unsupported file extension" in exc_info.value.detail

@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx2 not installed")
@patch("backend.src.bibliography.router.parse_bibliography_content")
def test_upload_bibliography_success(mock_parse):
    # Arrange
    mock_ref = ParsedReference(
        author="Test Author",
        year="2024",
        title="Test Title",
        journal="Test Journal",
        upload_datetime=datetime(2024, 1, 1, tzinfo=timezone.utc)
    )
    mock_parse.return_value = [mock_ref]

    file_content = b"fake bib content"
    files = {"file": ("test.bib", file_content, "text/plain")}
    
    # Act
    response = client.post("/api/bibliography/upload", files=files)
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Title"
    assert data[0]["author"] == "Test Author"
    mock_parse.assert_called_once_with("fake bib content", ".bib")

@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx2 not installed")
def test_upload_bibliography_invalid_extension():
    # Arrange
    file_content = b"fake ris content"
    files = {"file": ("test.ris", file_content, "text/plain")}
    
    # Act
    response = client.post("/api/bibliography/upload", files=files)
    
    # Assert
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


async def _run_batch_download_direct():
    async def mock_generator(*args, **kwargs):
        yield '{"log": "test"}'

    req = BatchDownloadRequest(
        dois=["10.1000/182"],
        delay=0,
        destination="/tmp/downloads",
        email="test@example.com",
        cookies="auth=123",
    )
    with patch(
        "backend.src.bibliography.router.execute_batch_download",
        side_effect=mock_generator,
    ):
        response = await batch_download(req)
        assert response.media_type == "text/event-stream"
        chunks = [chunk async for chunk in response.body_iterator]
        assert chunks == ['data: {"log": "test"}\n\n']


def test_batch_download_endpoint_direct():
    asyncio.run(_run_batch_download_direct())


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
def test_batch_download_endpoint_client():
    async def mock_generator(*args, **kwargs):
        yield '{"log": "test"}'

    payload = {
        "dois": ["10.1000/182"],
        "delay": 0,
        "destination": "/tmp/downloads",
        "email": "test@example.com",
        "cookies": "auth=123",
    }
    with patch(
        "backend.src.bibliography.router.execute_batch_download",
        side_effect=mock_generator,
    ):
        response = client.post(
            "/api/bibliography/batch-download", json=payload
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        assert 'data: {"log": "test"}\n\n' in response.text


async def _run_download_zip_direct():
    dummy_io = BytesIO(b"PK\x03\x04fakezip")
    req = ZipDownloadRequest(batch_name="test", dois=[])
    with patch(
        "backend.src.bibliography.router.create_zip_from_pdfs",
        return_value=dummy_io,
    ) as mock_service:
        response = await download_zip(req)
        assert response.media_type == "application/zip"
        assert (
            response.headers["Content-Disposition"]
            == "attachment; filename=test.zip"
        )
        mock_service.assert_called_once_with("test", [])


def test_download_zip_endpoint_direct():
    asyncio.run(_run_download_zip_direct())


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
def test_download_zip_endpoint_client():
    dummy_io = BytesIO(b"PK\x03\x04fakezip")
    payload = {"batch_name": "test", "dois": []}
    with patch(
        "backend.src.bibliography.router.create_zip_from_pdfs",
        return_value=dummy_io,
    ) as mock_service:
        response = client.post(
            "/api/bibliography/download-zip", json=payload
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/zip"
        assert (
            response.headers["content-disposition"]
            == "attachment; filename=test.zip"
        )
        mock_service.assert_called_once_with("test", [])


def test_inject_bibliography_direct_success():
    mock_ref = ParsedReference(
        author="Test Author",
        year="2024",
        title="Test Title",
        journal="Test Journal",
        upload_datetime=datetime(2024, 1, 1, tzinfo=timezone.utc),
    )
    with patch(
        "backend.src.bibliography.router.parse_bibliography_content",
        return_value=[mock_ref],
    ), patch(
        "backend.src.bibliography.router.inject_references_to_db",
        return_value=10,
    ):
        file = UploadFile(
            filename="references.bib",
            file=BytesIO(b"fake bib content"),
        )
        fake_db = MagicMock()
        result = asyncio.run(
            inject_bibliography(file, "PROJ-1", fake_db)
        )
        assert result == {"message": "Success", "inserted": 10}


def test_inject_bibliography_direct_invalid_extension():
    file = UploadFile(
        filename="references.ris",
        file=BytesIO(b"fake ris content"),
    )
    fake_db = MagicMock()
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(inject_bibliography(file, "PROJ-1", fake_db))
    assert exc_info.value.status_code == 400
    assert "Unsupported file extension" in exc_info.value.detail


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
@patch("backend.src.bibliography.router.inject_references_to_db")
@patch("backend.src.bibliography.router.parse_bibliography_content")
def test_inject_bibliography_endpoint_success(mock_parse, mock_inject):
    from backend.src.bibliography.router import get_db

    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        mock_ref = ParsedReference(
            author="Test Author",
            year="2024",
            title="Test Title",
            journal="Test Journal",
            upload_datetime=datetime(2024, 1, 1, tzinfo=timezone.utc),
        )
        mock_parse.return_value = [mock_ref]
        mock_inject.return_value = 10

        file_content = b"fake bib content"
        files = {"file": ("test.bib", file_content, "text/plain")}
        data = {"project_code": "PROJ-1"}

        response = client.post(
            "/api/bibliography/inject", files=files, data=data
        )
        assert response.status_code == 200
        assert response.json() == {"message": "Success", "inserted": 10}
        mock_inject.assert_called_once_with(mock_db, [mock_ref], "PROJ-1")
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
def test_inject_bibliography_endpoint_invalid_extension():
    file_content = b"fake ris content"
    files = {"file": ("test.ris", file_content, "text/plain")}
    data = {"project_code": "PROJ-1"}

    response = client.post(
        "/api/bibliography/inject", files=files, data=data
    )
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
def test_batch_download_local_endpoint_client():
    async def mock_generator(*args, **kwargs):
        yield '{"log": "local test"}'

    payload = {
        "file_path": "/fake/path.bib",
        "delay": 0,
        "destination": "/tmp/downloads",
        "email": "test@example.com",
        "cookies": "auth=123",
    }
    fake_bib = "Some content with DOI: 10.1000/182 and another 10.1000/182"

    mock_ref = ParsedReference(
        author="Test Author",
        year="2024",
        title="Test Title",
        journal="Test Journal",
        doi="10.1000/182",
        upload_datetime=datetime(2024, 1, 1, tzinfo=timezone.utc),
    )
    with patch("builtins.open", mock_open(read_data=fake_bib)), patch(
        "backend.src.bibliography.router.parse_bibliography_content",
        return_value=[mock_ref],
    ), patch(
        "backend.src.bibliography.router.execute_batch_download",
        side_effect=mock_generator,
    ) as mock_exec:
        response = client.post(
            "/api/bibliography/batch-download-local", json=payload
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        assert 'data: {"log": "local test"}\n\n' in response.text
        
        args, _ = mock_exec.call_args
        assert args[0] == ["10.1000/182"]


@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx not installed")
def test_get_project_references_endpoint():
    from backend.src.bibliography.router import get_db

    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        mock_proj = MagicMock()
        mock_proj.id = 1

        mock_link = MagicMock()
        mock_link.article_id = 10

        mock_art = MagicMock()
        mock_art.id = 10
        mock_art.title = "Test Paper"
        mock_art.author = "Test Author"
        mock_art.year = 2024
        mock_art.journal = "Test Journal"
        mock_art.doi = "10.1000/1"

        def query_side_effect(model):
            m = MagicMock()
            if "ProjectArticle" in str(model):
                m.filter.return_value.all.return_value = [mock_link]
            elif "Article" in str(model):
                m.filter.return_value.all.return_value = [mock_art]
            elif "Project" in str(model):
                m.filter.return_value.first.return_value = mock_proj
            return m

        mock_db.query.side_effect = query_side_effect

        response = client.get(
            "/api/bibliography/references?project_code=TEST"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Paper"
    finally:
        app.dependency_overrides.pop(get_db, None)