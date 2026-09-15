import sys
from pathlib import Path
import json
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
import pytest

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.src.bibliography.file_storage_service import save_pdf_bytes
from backend.src.bibliography.download_service import execute_batch_download, _download_and_save

def test_download_and_save_with_cookies():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b'%PDF'
    with patch('httpx.AsyncClient.get', new_callable=AsyncMock) as mock_get, patch(
        'backend.src.bibliography.download_service.save_pdf_bytes',
        new_callable=AsyncMock,
        return_value='/dest/x.pdf'
    ):
        mock_get.return_value = mock_resp
        asyncio.run(_download_and_save('/dest', '10.x', 'http://url', cookies="auth=123"))
        mock_get.assert_called_once()
        assert mock_get.call_args.kwargs.get('cookies') == {'auth': '123'}

def test_save_pdf_bytes(tmp_path: Path):
    dest_dir = str(tmp_path / "downloads")
    doi = "10.1000/182"
    pdf_data = b"%PDF-1.4 test content"

    saved_path = asyncio.run(save_pdf_bytes(dest_dir, doi, pdf_data))

    assert Path(saved_path).exists()
    assert Path(saved_path).read_bytes() == pdf_data
    assert "10.1000_182.pdf" in saved_path


async def _collect_events(dois, dest, email, delay=0):
    return [
        json.loads(chunk)
        async for chunk in execute_batch_download(
            dois, dest, email, delay=delay
        )
    ]


def test_execute_batch_download_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b"%PDF mock content"
    mock_resp.raise_for_status = MagicMock()

    with (
        patch(
            "backend.src.bibliography.download_service.resolve_pdf_url",
            new_callable=AsyncMock,
            return_value="https://example.com/paper.pdf",
        ),
        patch(
            "backend.src.bibliography.download_service.save_pdf_bytes",
            new_callable=AsyncMock,
            return_value="/downloads/10.x.pdf",
        ),
        patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get,
    ):
        mock_get.return_value = mock_resp
        events = asyncio.run(
            _collect_events(
                ["10.1000/182"], "/dest", "test@mail.com", delay=0
            )
        )

        assert len(events) == 3
        assert events[0]["progress"] == 0
        assert events[0]["total"] == 1
        assert "Resolving" in events[0]["log"]

        assert events[1]["progress"] == 1
        assert events[1]["total"] == 1
        assert "Downloaded" in events[1]["log"]

        assert events[2]["progress"] == 1
        assert events[2]["total"] == 1
        assert "finished" in events[2]["log"]


def test_execute_batch_download_no_url():
    with patch(
        "backend.src.bibliography.download_service.resolve_pdf_url",
        new_callable=AsyncMock,
        return_value=None,
    ):
        events = asyncio.run(
            _collect_events(
                ["10.1000/missing"], "/dest", "test@mail.com", delay=0
            )
        )

        assert len(events) == 3
        assert events[1]["progress"] == 1
        assert "No open access URL found" in events[1]["log"]


def test_execute_batch_download_http_error():
    mock_resp = MagicMock()
    mock_resp.raise_for_status.side_effect = httpx.HTTPStatusError(
        "Server Error", request=MagicMock(), response=MagicMock()
    )

    with (
        patch(
            "backend.src.bibliography.download_service.resolve_pdf_url",
            new_callable=AsyncMock,
            return_value="https://example.com/error.pdf",
        ),
        patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get,
    ):
        mock_get.return_value = mock_resp
        events = asyncio.run(
            _collect_events(
                ["10.1000/fail"], "/dest", "test@mail.com", delay=0
            )
        )

        assert len(events) == 3
        assert events[1]["progress"] == 1
        assert "Failed" in events[1]["log"]