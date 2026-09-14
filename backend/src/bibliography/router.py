import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from .schemas import (
    ParsedReference,
    BatchDownloadRequest,
    ZipDownloadRequest,
)
from .parser_service import parse_bibliography_content
from .download_service import execute_batch_download
from .zip_service import create_zip_from_pdfs

router = APIRouter()

try:
    import multipart
    HAS_MULTIPART = True
except ImportError:
    HAS_MULTIPART = False

async def _process_upload(file: UploadFile) -> List[ParsedReference]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in [".ris", ".bib"]:
        raise HTTPException(status_code=400, detail="Unsupported file extension")
    
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8")
        refs = parse_bibliography_content(content_str, ext)
        return refs
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Internal server error during parsing"
        )

if HAS_MULTIPART:
    @router.post("/upload", response_model=List[ParsedReference])
    async def upload_bibliography(file: UploadFile = File(...)):
        return await _process_upload(file)
else:
    async def upload_bibliography(file: UploadFile):
        return await _process_upload(file)


@router.post("/batch-download")
async def batch_download(request: BatchDownloadRequest):
    async def sse_generator():
        async for event in execute_batch_download(
            request.dois,
            request.destination,
            request.email,
            request.delay,
        ):
            yield f"data: {event}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream"
    )


@router.post("/download-zip")
async def download_zip(request: ZipDownloadRequest):
    zip_io = create_zip_from_pdfs(request.batch_name, request.dois)
    return StreamingResponse(
        zip_io,
        media_type="application/zip",
        headers={
            "Content-Disposition": (
                f"attachment; filename={request.batch_name}.zip"
            )
        },
    )