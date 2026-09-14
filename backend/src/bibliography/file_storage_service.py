from pathlib import Path
import re


async def save_pdf_bytes(
    destination_path: str, doi: str, pdf_bytes: bytes
) -> str:
    dest_dir = Path(destination_path).resolve()
    dest_dir.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r'[^\w\-.]', '_', doi)
    file_path = dest_dir / f"{safe_name}.pdf"
    file_path.write_bytes(pdf_bytes)
    return str(file_path.resolve())