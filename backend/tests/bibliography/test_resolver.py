import sys
from pathlib import Path
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
import pytest

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.src.bibliography.resolver_service import resolve_pdf_url


def test_resolve_pdf_url_unpaywall_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "is_oa": True,
        "best_oa_location": {
            "url_for_pdf": "http://pdf"
        }
    }
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        result = asyncio.run(resolve_pdf_url("10.mock", "e@mail.com"))
        assert result == "http://pdf"
        mock_get.assert_called_once()
        called_url = mock_get.call_args[0][0]
        assert "api.unpaywall.org/v2/10.mock" in called_url


def test_resolve_pdf_url_openalex_fallback():
    unpaywall_resp = MagicMock()
    unpaywall_resp.status_code = 404

    openalex_resp = MagicMock()
    openalex_resp.status_code = 200
    openalex_resp.json.return_value = {
        "open_access": {
            "oa_url": "https://openalex.org/pdf/paper.pdf"
        }
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = [unpaywall_resp, openalex_resp]
        result = asyncio.run(resolve_pdf_url("10.1000/182", "e@mail.com"))
        assert result == "https://openalex.org/pdf/paper.pdf"
        assert mock_get.call_count == 2


def test_resolve_pdf_url_both_fail():
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.ConnectError("Network failure")
        result = asyncio.run(resolve_pdf_url("10.mock", "e@mail.com"))
        assert result is None