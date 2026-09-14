from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ParsedReference(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    
    author: Optional[str] = None
    year: Optional[str] = None
    title: Optional[str] = None
    journal: Optional[str] = None
    upload_datetime: datetime