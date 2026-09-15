import sys
from pathlib import Path
import pytest
from pydantic import ValidationError

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.src.bibliography.schemas import (
    LocalBatchDownloadRequest,
    BatchDownloadRequest,
)


def test_local_batch_download_request_valid():
    payload = {
        "file_path": "/path/to/local/file.bib",
        "destination": "/tmp/downloads",
        "email": "test@example.com",
    }
    req = LocalBatchDownloadRequest(**payload)
    assert req.file_path == "/path/to/local/file.bib"
    assert req.destination == "/tmp/downloads"
    assert req.email == "test@example.com"
    assert req.delay == 5


def test_local_batch_download_request_with_cookies():
    payload = {
        "file_path": "/path",
        "destination": "/tmp",
        "email": "test@example.com",
        "cookies": "auth=123",
    }
    req = LocalBatchDownloadRequest(**payload)
    assert req.cookies == "auth=123"


def test_batch_download_request_with_cookies():
    payload = {
        "dois": ["10.1000/182"],
        "delay": 0,
        "destination": "/tmp",
        "email": "test@example.com",
        "cookies": "session=abc",
    }
    req = BatchDownloadRequest(**payload)
    assert req.cookies == "session=abc"


def test_local_batch_download_request_invalid_missing_fields():
    payload = {
        "file_path": "/path/to/local/file.bib",
    }
    with pytest.raises(ValidationError):
        LocalBatchDownloadRequest(**payload)