from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class BatchDownloadRequest(BaseModel):
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

class ParsedReference(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    
    author: Optional[str] = None
    year: Optional[str] = None
    title: Optional[str] = None
    journal: Optional[str] = None
    upload_datetime: datetime