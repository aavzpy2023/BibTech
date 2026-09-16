from datetime import datetime
from typing import Optional, List, Dict, Any, AsyncGenerator
from pydantic import BaseModel, ConfigDict, Field


class ZipDownloadRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")

    batch_name: str = Field(
        ...,
        description="The name of the batch folder containing the PDFs.",
    )
    dois: List[str] = Field(
        ...,
        description="List of DOIs to include in the ZIP archive.",
    )


class BatchDownloadRequest(BaseModel):
    cookies: Optional[str] = Field(
        None, description="Optional raw session cookies to bypass 403 blocks."
    )
    model_config = ConfigDict(strict=True, extra="forbid")

    dois: List[str] = Field(
        ...,
        description="List of Digital Object Identifiers to fetch."
    )
    delay: int = Field(
        ...,
        ge=0,
        description="Delay in seconds between sequential downloads."
    )
    destination: str = Field(
        ...,
        min_length=1,
        description="Target directory path for storing downloaded PDF files."
    )
    email: str = Field(
        ...,
        min_length=1,
        description="Contact email address for academic API polite pools."
    )


class LocalBatchDownloadRequest(BaseModel):
    cookies: Optional[str] = Field(
        None, description="Optional raw session cookies to bypass 403 blocks."
    )
    model_config = ConfigDict(strict=True, extra="forbid")

    file_path: str = Field(
        ...,
        min_length=1,
        description="Absolute or relative path to the local bibliography file."
    )
    destination: str = Field(
        ...,
        min_length=1,
        description="Target directory path for storing downloaded PDF files."
    )
    email: str = Field(
        ...,
        min_length=1,
        description="Contact email address for academic API polite pools."
    )
    delay: int = Field(
        5,
        ge=0,
        description="Delay in seconds between sequential downloads."
    )


class ParsedReference(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    
    author: Optional[str] = None
    year: Optional[str] = None
    title: Optional[str] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    abstract: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    keywords: Optional[str] = None
    keywords_plus: Optional[str] = None
    research_areas: Optional[str] = None
    web_of_science_categories: Optional[str] = None
    funding_text: Optional[str] = None
    journal_iso: Optional[str] = None
    oa_status: Optional[str] = None
    issn: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    times_cited: Optional[int] = None
    cited_references_count: Optional[int] = None
    raw_data: Optional[str] = None
    authors_detail: Optional[List[Dict[str, Any]]] = None
    countries: Optional[List[str]] = None
    cited_references: Optional[List[Dict[str, str]]] = None
    upload_datetime: datetime