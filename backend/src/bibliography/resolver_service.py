import re
from typing import Optional
from urllib.parse import urljoin
import httpx

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    ),
}

_PDF_META_PATTERNS = [
    re.compile(
        r'<meta[^>]+name=["\']citation_pdf_url["\'][^>]+content=["\']([^"\']+)["\']',
        re.IGNORECASE,
    ),
    re.compile(
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']citation_pdf_url["\']',
        re.IGNORECASE,
    ),
    re.compile(
        r'<link[^>]+type=["\']application/pdf["\'][^>]+href=["\']([^"\']+)["\']',
        re.IGNORECASE,
    ),
]


async def resolve_institutional_pdf_url(doi: str, client: Optional[httpx.AsyncClient]=None, cookies: Optional[str] = None) -> Optional[str]:
    doi_url = f'https://doi.org/{doi}'
    close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=15.0, follow_redirects=True)
        close_client = True

    parsed_cookies = dict(x.split('=', 1) for x in cookies.split('; ') if '=' in x) if isinstance(cookies, str) and cookies.strip() else None
    try:
        res = await client.get(doi_url, headers=_BROWSER_HEADERS, follow_redirects=True, cookies=parsed_cookies)
        if res.status_code == 200:
            html = res.text
            for pattern in _PDF_META_PATTERNS:
                match = pattern.search(html)
                if match:
                    raw_url = match.group(1).strip()
                    return urljoin(str(res.url), raw_url)
    except Exception:
        pass
    finally:
        if close_client:
            await client.aclose()

    return None


async def resolve_pdf_url(doi: str, email: str, cookies: Optional[str] = None) -> Optional[str]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"https://api.unpaywall.org/v2/{doi}?email={email}"
            res = await client.get(url)
            if res.status_code == 200:
                loc = res.json().get("best_oa_location") or {}
                if pdf_url := loc.get("url_for_pdf"):
                    return str(pdf_url)
        except Exception:
            pass
        try:
            url = f"https://api.openalex.org/works/doi:{doi}"
            res = await client.get(url)
            if res.status_code == 200:
                oa = res.json().get("open_access") or {}
                if oa_url := oa.get("oa_url"):
                    return str(oa_url)
        except Exception:
            pass
        try:
            inst_url = await resolve_institutional_pdf_url(doi, client=client, cookies=cookies)
            if inst_url:
                return inst_url
        except Exception:
            pass
    return None