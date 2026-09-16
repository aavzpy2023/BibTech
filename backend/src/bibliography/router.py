import os
import re
from datetime import datetime, timezone
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
    from ..database.models.core import Article, Project, ProjectArticle
except (ImportError, ValueError):
    try:
        from src.database.session import get_db
        from src.database.models.core import (
            Article,
            Project,
            ProjectArticle,
        )
    except ImportError:
        from backend.src.database.session import get_db
        from backend.src.database.models.core import (
            Article,
            Project,
            ProjectArticle,
        )
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
    if ext.lower() not in [".bib"]:
        raise HTTPException(status_code=400, detail="Unsupported file extension")
    
    try:
        content_bytes = await file.read()
        try:
            content_str = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content_str = content_bytes.decode("latin-1")
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
    if ext.lower() not in [".bib"]:
        raise HTTPException(
            status_code=400, detail="Unsupported file extension"
        )

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8")
        refs = parse_bibliography_content(content_str, ext)
        try:
            inserted = inject_references_to_db(db, refs, project_code)
        except RuntimeError:
            raise HTTPException(
                status_code=503,
                detail="Error de conexión a la base de datos. Intente nuevamente."
            )
        return {"message": "Success", "inserted": inserted}
    except HTTPException:
        raise
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

    @router.get("/references", response_model=List[ParsedReference])
    def get_project_references(
        project_code: str,
        db: Session = Depends(get_db),
    ):
        project = (
            db.query(Project).filter(Project.name == project_code).first()
        )
        if not project:
            return []
        links = (
            db.query(ProjectArticle)
            .filter(ProjectArticle.project_id == project.id)
            .all()
        )
        article_ids = [link.article_id for link in links]
        if not article_ids:
            return []
        articles = (
            db.query(Article).filter(Article.id.in_(article_ids)).all()
        )
        def _to_str(val):
            return str(val) if isinstance(val, (str, int, float)) else None

        def _format_surname(raw_author):
            if not raw_author or not isinstance(raw_author, str):
                return "N/A"
            clean = raw_author.strip()
            if not clean:
                return "N/A"
            first = re.split(r"\s+and\s+|;\s*", clean, flags=re.I)[0].strip()
            if not first:
                return "N/A"
            surname = first.split(",")[0].strip() if "," in first else (
                first.split()[-1] if first.split() else first
            )
            return f"{surname} ..."

        now = datetime.now(timezone.utc)
        return [
            ParsedReference(
                author=_format_surname(
                    a.authors[0].name
                    if hasattr(a, "authors") and a.authors
                    else (
                        getattr(a, "raw_data", None)
                        or _to_str(getattr(a, "author", None))
                    )
                ),
                year=_to_str(getattr(a, "year", None)),
                title=_to_str(getattr(a, "title", None)) or "Untitled",
                journal=_to_str(getattr(a, "journal", None)),
                doi=_to_str(getattr(a, "doi", None)),
                upload_datetime=now,
            )
            for a in articles
        ]
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
            request.cookies,
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
    
    _, ext = os.path.splitext(request.file_path)
    try:
        refs = parse_bibliography_content(content, ext)
        dois = list(set(ref.doi for ref in refs if ref.doi))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parse error: {str(e)}")

    async def sse_generator():
        async for event in execute_batch_download(
            dois,
            request.destination,
            request.email,
            request.delay,
            request.cookies,
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