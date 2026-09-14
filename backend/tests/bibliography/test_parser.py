import pytest
from backend.src.bibliography.parser_service import parse_bibliography_content

def test_parse_ris_content():
    ris_content = (
        "TY  - JOUR\n"
        "AU  - Smith, John\n"
        "AU  - Doe, Jane\n"
        "PY  - 2023\n"
        "TI  - A Great Paper\n"
        "JO  - Journal of Testing\n"
        "ER  - \n"
    )
    refs = parse_bibliography_content(ris_content, ".ris")
    
    assert len(refs) == 1
    assert refs[0].title == "A Great Paper"
    assert refs[0].year == "2023"
    assert refs[0].journal == "Journal of Testing"
    assert "Smith, John" in refs[0].author
    assert "Doe, Jane" in refs[0].author
    assert refs[0].upload_datetime is not None

def test_parse_bib_content():
    bib_content = (
        "@article{smith2023,\n"
        "  author = {Smith, John and Doe, Jane},\n"
        "  year = {2023},\n"
        "  title = {Another Great Paper},\n"
        "  journal = {Journal of BibTeX}\n"
        "}"
    )
    refs = parse_bibliography_content(bib_content, ".bib")
    
    assert len(refs) == 1
    assert refs[0].title == "Another Great Paper"
    assert refs[0].year == "2023"
    assert refs[0].journal == "Journal of BibTeX"
    assert "Smith, John" in refs[0].author
    assert refs[0].upload_datetime is not None

def test_unsupported_extension():
    with pytest.raises(ValueError, match="Unsupported extension"):
        parse_bibliography_content("some content", ".txt")