import io
import os
import zipfile
from typing import List


def create_zip_from_pdfs(batch_name: str, dois: List[str]) -> io.BytesIO:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for doi in dois:
            filename = f"{doi.replace('/', '_')}.pdf"
            path = os.path.join(batch_name, filename)
            if os.path.exists(path):
                with open(path, "rb") as f:
                    zf.writestr(filename, f.read())
    buffer.seek(0)
    return buffer