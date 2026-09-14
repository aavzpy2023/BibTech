import sys
from pathlib import Path
import pytest

_root = Path(__file__).resolve().parents[3]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

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


def test_parse_wos_bib_content_capitalized_fields():
    bib_content = (
        "@article{WOS:000621765000076,\n"
        "  Author = {Vinajera, Andrey and Perez, Juan},\n"
        "  Title = {Deep Learning Bibliometrics in Modern Architecture},\n"
        "  Journal = {Scientometrics},\n"
        "  Year = {2021},\n"
        "  Volume = {126},\n"
        "  Number = {3},\n"
        "  DOI = {10.1007/s11192-021-03890-w}\n"
        "}\n"
    )
    refs = parse_bibliography_content(bib_content, ".bib")
    assert len(refs) == 1
    assert refs[0].title == "Deep Learning Bibliometrics in Modern Architecture"
    assert "Vinajera, Andrey" in refs[0].author
    assert refs[0].journal == "Scientometrics"
    assert refs[0].year == "2021"
    assert refs[0].doi == "10.1007/s11192-021-03890-w"


def test_parse_wos_ris_multiple_papers_with_varied_tags():
    ris_content = (
        "TY  - JOUR\n"
        "TI  - First Paper Title\n"
        "AU  - Author One\n"
        "AU  - Author Two\n"
        "T2  - Journal of Science\n"
        "PY  - 2021///\n"
        "DO  - 10.1000/182\n"
        "ER  - \n\n"
        "TY  - JOUR\n"
        "T1  - Second Paper Title\n"
        "A1  - Author Three\n"
        "JO  - Nature Communications\n"
        "Y1  - 2022/03/15/\n"
        "ER  - \n\n"
        "TY  - JOUR\n"
        "TI  - Third Paper Title\n"
        "AU  - Author Four\n"
        "JF  - Physical Review B\n"
        "PY  - 2023\n"
        "ER  - \n"
    )
    refs = parse_bibliography_content(ris_content, ".ris")
    assert len(refs) == 3
    assert refs[0].title == "First Paper Title"
    assert refs[0].journal == "Journal of Science"
    assert refs[0].year == "2021"
    assert refs[0].doi == "10.1000/182"
    assert refs[1].title == "Second Paper Title"
    assert refs[1].journal == "Nature Communications"
    assert refs[1].year == "2022"
    assert refs[2].title == "Third Paper Title"
    assert refs[2].journal == "Physical Review B"
    assert refs[2].year == "2023"