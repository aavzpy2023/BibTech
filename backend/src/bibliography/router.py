import os
import re
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .schemas import (
    ParsedReference,
    BatchDownloadRequest,
    ZipDownloadRequest,
    LocalBatchDownloadRequest,
)
from .parser_service import parse_bibliography_content
from .download_service import execute_batch_download
from .zip_service import create_zip_from_pdfs
from .injection_service import inject_references_to_db

try:
    from ..database.session import get_db
except (ImportError, ValueError):
    try:
        from src.database.session import get_db
    except ImportError:
        from backend.src.database.session import get_db

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


async def _process_inject(
    file: UploadFile, project_code: str, db: Session
) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in [".ris", ".bib"]:
        raise HTTPException(
            status_code=400, detail="Unsupported file extension"
        )

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8")
        refs = parse_bibliography_content(content_str, ext)
        inserted = inject_references_to_db(db, refs, project_code)
        return {"message": "Success", "inserted": inserted}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during injection: {str(exc)}",
        )

if HAS_MULTIPART:
    @router.post("/upload", response_model=List[ParsedReference])
    async def upload_bibliography(file: UploadFile = File(...)):
        return await _process_upload(file)

    @router.post("/inject")
    async def inject_bibliography(
        file: UploadFile = File(...),
        project_code: str = Form(...),
        db: Session = Depends(get_db),
    ):
        return await _process_inject(file, project_code, db)
else:
    async def upload_bibliography(file: UploadFile):
        return await _process_upload(file)

    async def inject_bibliography(
        file: UploadFile,
        project_code: str,
        db: Session,
    ):
        return await _process_inject(file, project_code, db)


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


@router.post("/batch-download-local")
async def batch_download_local(request: LocalBatchDownloadRequest):
    try:
        with open(request.file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")
    
    dois = list(set(re.findall(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", content, re.I)))

    async def sse_generator():
        async for event in execute_batch_download(
            dois, request.destination, request.email, request.delay
        ):
            yield f"data: {event}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


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