import os
import re
from datetime import datetime, timezone
from typing import List, Dict, Any
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

    @router.get("/references", response_model=List[Dict[str, Any]])
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
        if not links:
            return []

        status_map = {
            link.article_id: {
                "status": link.status,
                "added_at": (
                    link.added_at.isoformat() if link.added_at else None
                ),
            }
            for link in links
        }

        article_ids = list(status_map.keys())
        articles = (
            db.query(Article).filter(Article.id.in_(article_ids)).all()
        )

        def _to_str(val):
            return str(val) if isinstance(val, (str, int, float)) else None

        def _is_mock(val):
            return hasattr(val, "_mock_return_value") or hasattr(
                val, "_mock_name"
            )

        def _to_int(val):
            if val is not None and not _is_mock(val):
                try:
                    return int(val)
                except (ValueError, TypeError):
                    pass
            return None

        def _safe_list(val):
            if val is None or _is_mock(val):
                return []
            if isinstance(val, (list, tuple, set)):
                return [x for x in val if not _is_mock(x)]
            return []

        now_iso = datetime.now(timezone.utc).isoformat()
        result = []
        for a in articles:
            authors_detail = []
            for aa in sorted(
                _safe_list(getattr(a, "author_articles", None)),
                key=lambda x: getattr(x, "author_order", 1) or 1,
            ):
                auth = getattr(aa, "author", None)
                if auth and not _is_mock(auth):
                    aff = getattr(auth, "affiliation", None)
                    aff_str = None
                    if aff and not _is_mock(aff):
                        inst = getattr(aff, "institution", None)
                        dept = getattr(aff, "department", None)
                        country = getattr(aff, "country", None)
                        parts = []
                        if inst and isinstance(inst, str):
                            parts.append(inst.strip().rstrip("."))
                        if dept and isinstance(dept, str):
                            dept_clean = dept.strip().rstrip(".")
                            if not inst or dept_clean.lower() not in inst.lower():
                                parts.append(dept_clean)
                        if country and isinstance(country, str):
                            c_clean = country.strip().rstrip(".")
                            if not inst or c_clean.lower() not in inst.lower():
                                parts.append(c_clean)
                        aff_str = ", ".join(parts) if parts else None
                    authors_detail.append({
                        "name": getattr(auth, "name", "N/A"),
                        "orcid": getattr(auth, "orcid", None),
                        "email": getattr(auth, "email", None),
                        "author_order": getattr(aa, "author_order", 1),
                        "is_corresponding": bool(
                            getattr(aa, "is_corresponding", False)
                        ),
                        "affiliation": aff_str,
                    })

            author_val = _to_str(getattr(a, "author", None))
            if authors_detail:
                author_str = " and ".join(
                    [ad["name"] for ad in authors_detail]
                )
            elif author_val:
                author_str = author_val
            elif getattr(a, "authors", None) and not _is_mock(a.authors):
                names = [
                    getattr(x, "name", str(x))
                    for x in _safe_list(a.authors)
                    if getattr(x, "name", str(x)) and not _is_mock(x)
                ]
                author_str = " and ".join(names) if names else "N/A"
            elif getattr(a, "raw_data", None):
                author_str = str(a.raw_data)[:100]
            else:
                author_str = "N/A"

            keywords_list = [
                {
                    "name": getattr(k, "name", ""),
                    "type": getattr(k, "type", "author"),
                }
                for k in _safe_list(getattr(a, "keywords", None))
            ]

            references_list = [
                {
                    "id": getattr(r, "id", None),
                    "title": getattr(r, "title", None),
                    "doi": getattr(r, "doi", None),
                    "year": getattr(r, "year", None),
                    "raw_citation": getattr(r, "raw_citation", None),
                }
                for r in _safe_list(getattr(a, "references", None))
            ]

            funding_list = [
                {
                    "id": getattr(f, "id", None),
                    "agency": getattr(f, "agency", None),
                    "grant_number": getattr(f, "grant_number", None),
                    "country": getattr(f, "country", None),
                }
                for f in _safe_list(getattr(a, "funding", None))
            ]

            downloads_list = [
                {
                    "id": getattr(d, "id", None),
                    "source": getattr(d, "source", None),
                    "status": getattr(d, "status", None),
                    "file_path": getattr(d, "file_path", None),
                    "file_size_bytes": getattr(d, "file_size_bytes", None),
                    "downloaded_at": (
                        d.downloaded_at.isoformat()
                        if getattr(d, "downloaded_at", None)
                        and not _is_mock(d.downloaded_at)
                        else None
                    ),
                }
                for d in _safe_list(getattr(a, "downloads", None))
            ]

            p_info = status_map.get(a.id, {})

            result.append({
                "id": a.id,
                "title": _to_str(getattr(a, "title", None)) or "Untitled",
                "author": author_str,
                "year": _to_str(getattr(a, "year", None)),
                "journal": _to_str(getattr(a, "journal", None)),
                "doi": _to_str(getattr(a, "doi", None)),
                "volume": _to_str(getattr(a, "volume", None)),
                "issue": _to_str(getattr(a, "issue", None)),
                "pages": _to_str(getattr(a, "pages", None)),
                "abstract": _to_str(getattr(a, "abstract", None)),
                "publisher": _to_str(getattr(a, "publisher", None)),
                "language": _to_str(getattr(a, "language", None)),
                "research_areas": _to_str(getattr(a, "research_areas", None)),
                "web_of_science_categories": _to_str(getattr(a, "web_of_science_categories", None)),
                "funding_text": _to_str(getattr(a, "funding_text", None)),
                "journal_iso": _to_str(getattr(a, "journal_iso", None)),
                "oa_status": _to_str(getattr(a, "oa_status", None)),
                "issn": _to_str(getattr(a, "issn", None)),
                "times_cited": _to_int(getattr(a, "times_cited", None)),
                "cited_references_count": _to_int(getattr(a, "cited_references_count", None)),
                "raw_data": _to_str(getattr(a, "raw_data", None)),
                "created_at": (
                    a.created_at.isoformat()
                    if getattr(a, "created_at", None)
                    else None
                ),
                "updated_at": (
                    a.updated_at.isoformat()
                    if getattr(a, "updated_at", None)
                    else None
                ),
                "project_status": p_info.get("status", "pending"),
                "project_added_at": p_info.get("added_at"),
                "upload_datetime": now_iso,
                "authors_detail": authors_detail,
                "keywords": keywords_list,
                "references_list": references_list,
                "funding_list": funding_list,
                "downloads_list": downloads_list,
            })
        return result
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
