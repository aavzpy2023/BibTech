import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import datetime, timezone
from backend.main import app
from backend.src.bibliography.schemas import ParsedReference

client = TestClient(app)

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

def test_upload_bibliography_invalid_extension():
    # Arrange
    file_content = b"fake txt content"
    files = {"file": ("test.txt", file_content, "text/plain")}
    
    # Act
    response = client.post("/api/bibliography/upload", files=files)
    
    # Assert
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]