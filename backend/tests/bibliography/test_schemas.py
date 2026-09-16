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
    ParsedReference,
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


def test_parsed_reference_extended_metadata():
    from datetime import datetime, timezone

    payload = {
        "author": "Vaswani et al.",
        "year": "2017",
        "title": "Attention Is All You Need",
        "journal": "NeurIPS",
        "doi": "10.1000/182",
        "upload_datetime": datetime.now(timezone.utc),
        "abstract": "The dominant sequence transduction models...",
        "publisher": "NeurIPS Foundation",
        "language": "English",
        "keywords": "attention, transformer",
        "research_areas": "Computer Science",
        "web_of_science_categories": "AI",
        "funding_text": "Funded by Google",
        "journal_iso": "NeurIPS",
        "oa_status": "Gold",
        "issn": "1234-5678",
        "volume": "30",
        "issue": "1",
        "pages": "5998-6008",
        "times_cited": 15000,
        "cited_references_count": 40,
    }
    ref = ParsedReference(**payload)
    assert ref.abstract == "The dominant sequence transduction models..."
    assert ref.publisher == "NeurIPS Foundation"
    assert ref.times_cited == 15000
    assert ref.cited_references_count == 40
    assert ref.volume == "30"