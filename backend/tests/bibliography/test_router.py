import sys
from pathlib import Path
from io import BytesIO
import asyncio
from unittest.mock import patch
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

from backend.src.bibliography.router import upload_bibliography

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
            filename="test.ris",
            file=BytesIO(b"fake ris content")
        )
        result = asyncio.run(upload_bibliography(file))
        assert len(result) == 1
        assert result[0].title == "Test Title"

def test_upload_bibliography_direct_invalid_extension():
    file = UploadFile(
        filename="test.txt",
        file=BytesIO(b"fake txt content")
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

    file_content = b"fake ris content"
    files = {"file": ("test.ris", file_content, "text/plain")}
    
    # Act
    response = client.post("/api/bibliography/upload", files=files)
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Title"
    assert data[0]["author"] == "Test Author"
    mock_parse.assert_called_once_with("fake ris content", ".ris")

@pytest.mark.skipif(not HAS_TESTCLIENT, reason="httpx2 not installed")
def test_upload_bibliography_invalid_extension():
    # Arrange
    file_content = b"fake txt content"
    files = {"file": ("test.txt", file_content, "text/plain")}
    
    # Act
    response = client.post("/api/bibliography/upload", files=files)
    
    # Assert
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]