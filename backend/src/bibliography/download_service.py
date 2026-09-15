import asyncio
import json
import random
from typing import AsyncGenerator, List
import httpx
from .resolver_service import resolve_pdf_url, _BROWSER_HEADERS
from .file_storage_service import save_pdf_bytes

async def _download_and_save(dest: str, doi: str, url: str, cookies: Optional[str] = None) -> str:
    parsed_cookies = dict(x.split('=', 1) for x in cookies.split('; ') if '=' in x) if isinstance(cookies, str) and cookies.strip() else None
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(url, headers=_BROWSER_HEADERS, cookies=parsed_cookies)
        res.raise_for_status()
        return await save_pdf_bytes(dest, doi, res.content)


async def execute_batch_download(dois: List[str], dest: str, email: str, delay: int, cookies: Optional[str] = None) -> AsyncGenerator[str, None]:
    total, completed = (len(dois), 0)
    for doi in dois:
        yield json.dumps({
            "progress": completed,
            "total": total,
            "log": f"Resolving: {doi}",
            "doi": doi,
            "status": "resolving",
        })
        try:
            url = await resolve_pdf_url(doi, email, cookies)
            if url:
                path = await _download_and_save(dest, doi, url, cookies)
                log = f'Downloaded {doi} to {path}'
                status = 'downloaded'
            else:
                log = f'No open access URL found for {doi}'
                status = 'not_found'
        except Exception as err:
            log = f'Failed {doi}: {err}'
            status = 'failed'
        completed += 1
        yield json.dumps({
            'progress': completed,
            'total': total,
            'log': log,
            'doi': doi,
            'status': status,
            "log": log
        })
        if completed < total:
            sleep_duration = (
                random.uniform(2.0, 5.0) if delay != 0 else 0
            )
            if sleep_duration > 0:
                await asyncio.sleep(sleep_duration)
    yield json.dumps({
        "progress": total,
        "total": total,
        "log": "Batch processing finished"
    })
