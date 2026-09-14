from typing import Optional
import httpx


async def resolve_pdf_url(doi: str, email: str) -> Optional[str]:
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
    return None