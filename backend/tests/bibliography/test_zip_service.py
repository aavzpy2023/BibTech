import io
import os
import zipfile
from unittest.mock import patch, mock_open
from backend.src.bibliography.zip_service import create_zip_from_pdfs


def test_create_zip_from_pdfs_success():
    batch_name = "batch1"
    dois = ["10.1/123"]
    dummy_pdf_content = b"%PDF-1.4 dummy binary content"
    expected_path = os.path.join(batch_name, "10.1_123.pdf")

    with patch("os.path.exists", return_value=True) as mock_exists, patch(
        "builtins.open", mock_open(read_data=dummy_pdf_content)
    ) as mock_file:
        result = create_zip_from_pdfs(batch_name, dois)

        assert isinstance(result, io.BytesIO)
        assert result.tell() == 0
        content = result.getvalue()
        assert len(content) > 0
        assert content.startswith(b"PK")

        assert zipfile.is_zipfile(result)
        with zipfile.ZipFile(result, "r") as zf:
            assert zf.namelist() == ["10.1_123.pdf"]
            assert zf.read("10.1_123.pdf") == dummy_pdf_content

        mock_exists.assert_called_once_with(expected_path)
        mock_file.assert_called_once_with(expected_path, "rb")


def test_create_zip_from_pdfs_file_not_found():
    batch_name = "batch1"
    dois = ["10.1/missing"]

    with patch("os.path.exists", return_value=False):
        result = create_zip_from_pdfs(batch_name, dois)

        assert isinstance(result, io.BytesIO)
        assert zipfile.is_zipfile(result)
        with zipfile.ZipFile(result, "r") as zf:
            assert zf.namelist() == []


def test_create_zip_from_pdfs_multiple_dois():
    batch_name = "batch1"
    dois = ["10.1/found", "10.1/missing"]
    dummy_pdf = b"%PDF-1.4 sample"

    def fake_exists(path):
        return "found" in path

    with patch("os.path.exists", side_effect=fake_exists), patch(
        "builtins.open", mock_open(read_data=dummy_pdf)
    ):
        result = create_zip_from_pdfs(batch_name, dois)

        with zipfile.ZipFile(result, "r") as zf:
            assert zf.namelist() == ["10.1_found.pdf"]