import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from .schemas import ParsedReference
from .parser_service import parse_bibliography_content

router = APIRouter()

@router.post("/upload", response_model=List[ParsedReference])
async def upload_bibliography(file: UploadFile = File(...)):
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
        raise HTTPException(status_code=500, detail="Internal server error during parsing")