import asyncio
import json
from typing import AsyncGenerator, List
import httpx
from .resolver_service import resolve_pdf_url
from .file_storage_service import save_pdf_bytes


async def _download_and_save(dest: str, doi: str, url: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(url)
        res.raise_for_status()
        return await save_pdf_bytes(dest, doi, res.content)


async def execute_batch_download(
    dois: List[str], dest: str, email: str, delay: int
) -> AsyncGenerator[str, None]:
    total, completed = len(dois), 0
    for doi in dois:
        yield json.dumps({
            "progress": completed,
            "total": total,
            "log": f"Resolving: {doi}",
            "doi": doi,
            "status": "resolving",
        })
        try:
            url = await resolve_pdf_url(doi, email)
            if url:
                path = await _download_and_save(dest, doi, url)
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
        if delay > 0 and completed < total:
            await asyncio.sleep(delay)
    yield json.dumps({
        "progress": total,
        "total": total,
        "log": "Batch processing finished"
    })
