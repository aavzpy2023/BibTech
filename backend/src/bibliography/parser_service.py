import datetime
from typing import List, Optional
import rispy
import bibtexparser
from .schemas import ParsedReference


def _extract_bib_field(entry, key: str) -> Optional[str]:
    if isinstance(entry, dict):
        val = entry.get(key)
    elif hasattr(entry, "fields_dict") and key in entry.fields_dict:
        field = entry.fields_dict[key]
        val = getattr(field, "value", str(field))
    elif hasattr(entry, "fields"):
        val = None
        for field in entry.fields:
            if getattr(field, "key", None) == key:
                val = getattr(field, "value", str(field))
                break
    elif hasattr(entry, key):
        val = getattr(entry, key)
    elif hasattr(entry, "get"):
        try:
            val = entry.get(key)
        except Exception:
            val = None
    else:
        val = None

    if val is not None:
        if hasattr(val, "value"):
            val = val.value
        return str(val)
    return None


def _parse_bibtex_entries(content: str) -> list:
    if hasattr(bibtexparser, "parse_string"):
        result = bibtexparser.parse_string(content)
        return list(getattr(result, "entries", getattr(result, "blocks", [])))
    if hasattr(bibtexparser, "loads"):
        result = bibtexparser.loads(content)
        return list(getattr(result, "entries", []))
    if hasattr(bibtexparser, "bparser"):
        parser = bibtexparser.bparser.BibTexParser()
        result = parser.parse(content)
        return list(getattr(result, "entries", []))
    return []

def parse_bibliography_content(content: str, ext: str) -> List[ParsedReference]:
    parsed_refs: List[ParsedReference] = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    if ext.lower() == ".ris":
        # rispy.loads maneja el string crudo y extrae diccionarios
        entries = rispy.loads(content)
        for entry in entries:
            authors = entry.get("authors", [])
            author_str = " and ".join(authors) if isinstance(authors, list) else authors
            
            parsed_refs.append(
                ParsedReference(
                    author=author_str or None,
                    year=entry.get("year", None),
                    title=entry.get("title", None),
                    journal=entry.get("journal_name", None),
                    upload_datetime=now
                )
            )
            
    elif ext.lower() == ".bib":
        entries = _parse_bibtex_entries(content)
        for entry in entries:
            parsed_refs.append(
                ParsedReference(
                    author=_extract_bib_field(entry, "author"),
                    year=_extract_bib_field(entry, "year"),
                    title=_extract_bib_field(entry, "title"),
                    journal=_extract_bib_field(entry, "journal"),
                    upload_datetime=now
                )
            )
    else:
        raise ValueError(f"Unsupported extension: {ext}")
        
    return parsed_refs