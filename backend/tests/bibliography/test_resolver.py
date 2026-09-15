import sys
from pathlib import Path
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
import pytest

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.src.bibliography.resolver_service import (
    resolve_pdf_url,
    resolve_institutional_pdf_url,
)


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


def test_resolve_institutional_pdf_url_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.url = "https://link.springer.com/article/10.1007/s001"
    mock_resp.text = (
        '<html><head><meta name="citation_pdf_url" '
        'content="https://link.springer.com/content/pdf/10.1007/s001.pdf">'
        '</head><body></body></html>'
    )
    with patch('httpx.AsyncClient.get', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        result = asyncio.run(resolve_institutional_pdf_url('10.1007/s001', cookies="auth=123"))
        assert result == 'https://link.springer.com/content/pdf/10.1007/s001.pdf'
        mock_get.assert_called_once()
        kwargs = mock_get.call_args.kwargs
        assert kwargs.get('cookies') == {'auth': '123'}
        )


def test_resolve_institutional_pdf_url_relative_path():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.url = "https://sciencedirect.com/science/article/pii/S123"
    mock_resp.text = (
        '<html><head><meta name="citation_pdf_url" '
        'content="/science/article/pii/S123/pdfft?md5=abc">'
        '</head></html>'
    )
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        result = asyncio.run(resolve_institutional_pdf_url("10.1016/S123"))
        assert result == (
            "https://sciencedirect.com/science/article/pii/S123/pdfft?md5=abc"
        )


def test_resolve_pdf_url_institutional_fallback():
    unpaywall_resp = MagicMock()
    unpaywall_resp.status_code = 404

    openalex_resp = MagicMock()
    openalex_resp.status_code = 200
    openalex_resp.json.return_value = {"open_access": {"oa_url": None}}

    inst_resp = MagicMock()
    inst_resp.status_code = 200
    inst_resp.url = "https://ieeexplore.ieee.org/document/12345"
    inst_resp.text = (
        '<html><head><meta name="citation_pdf_url" '
        'content="https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=12345">'
        '</head></html>'
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = [unpaywall_resp, openalex_resp, inst_resp]
        result = asyncio.run(
            resolve_pdf_url("10.1109/12345", "test@mail.com")
        )
        assert result == (
            "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=12345"
        )
        assert mock_get.call_count == 3