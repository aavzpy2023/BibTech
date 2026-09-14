import datetime
from typing import List, Optional
import re
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
        cleaned = str(val).strip()
        if cleaned.startswith("{") and cleaned.endswith("}"):
            cleaned = cleaned[1:-1].strip()
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1].strip()
        if key.lower() == "year":
            match = re.search(r"\b(19\d\d|20\d\d)\b", cleaned)
            return match.group(1) if match else (cleaned or None)
        return cleaned or None
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


def _clean_year(val: Optional[str]) -> Optional[str]:
    if not val:
        return None
    match = re.search(r"\b(19\d\d|20\d\d)\b", str(val))
    if match:
        return match.group(1)
    cleaned = re.sub(r"[^\d]", "", str(val))
    return cleaned[:4] if len(cleaned) >= 4 else (cleaned or None)


def _extract_ris_title(entry: dict) -> Optional[str]:
    return (
        entry.get("title")
        or entry.get("primary_title")
        or entry.get("TI")
        or entry.get("T1")
        or entry.get("CT")
        or None
    )


def _extract_ris_journal(entry: dict) -> Optional[str]:
    return (
        entry.get("journal_name")
        or entry.get("secondary_title")
        or entry.get("T2")
        or entry.get("JO")
        or entry.get("JF")
        or entry.get("JA")
        or entry.get("J2")
        or None
    )


def _extract_ris_authors(entry: dict) -> Optional[str]:
    authors = (
        entry.get("authors")
        or entry.get("primary_authors")
        or entry.get("AU")
        or entry.get("A1")
        or []
    )
    if isinstance(authors, list):
        clean_authors = [str(a).strip() for a in authors if str(a).strip()]
        return " and ".join(clean_authors) if clean_authors else None
    if isinstance(authors, str) and authors.strip():
        return authors.strip()
    return None


def _extract_ris_year(entry: dict) -> Optional[str]:
    raw_year = (
        entry.get("year")
        or entry.get("publication_year")
        or entry.get("PY")
        or entry.get("Y1")
        or entry.get("DA")
        or None
    )
    return _clean_year(raw_year)


def _extract_ris_doi(entry: dict) -> Optional[str]:
    doi = entry.get("doi") or entry.get("DO") or entry.get("DI") or None
    if doi:
        return (
            str(doi)
            .strip()
            .replace("https://doi.org/", "")
            .replace("http://doi.org/", "")
        )
    return None


def _parse_ris_fallback(content: str) -> list:
    entries = []
    current_entry = {}
    current_tag = None

    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        match = re.match(r"^([A-Z0-9]{2})\s*-\s*(.*)$", line)
        if match:
            tag, val = match.group(1), match.group(2).strip()
            current_tag = tag
            if tag == "TY":
                if current_entry and (
                    current_entry.get("TI")
                    or current_entry.get("title")
                    or current_entry.get("AU")
                ):
                    entries.append(current_entry)
                current_entry = {"TY": val, "authors": []}
            elif tag == "ER":
                if current_entry:
                    entries.append(current_entry)
                    current_entry = {}
            elif tag in ("AU", "A1"):
                if "authors" not in current_entry:
                    current_entry["authors"] = []
                current_entry["authors"].append(val)
            else:
                current_entry[tag] = val
        elif current_tag and current_entry:
            if current_tag not in ("AU", "A1") and current_tag in current_entry:
                current_entry[current_tag] += " " + line

    if current_entry and (
        current_entry.get("TI")
        or current_entry.get("title")
        or current_entry.get("AU")
    ):
        entries.append(current_entry)

    return entries


def parse_bibliography_content(content: str, ext: str) -> List[ParsedReference]:
    parsed_refs: List[ParsedReference] = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    if ext.lower() == ".ris":
        entries = []
        try:
            entries = rispy.loads(content, skip_unknown_tags=True)
        except Exception:
            entries = []

        fallback_entries = _parse_ris_fallback(content)
        if len(fallback_entries) > len(entries):
            entries = fallback_entries

        for entry in entries:
            authors = entry.get("authors", [])
            author_str = " and ".join(authors) if isinstance(authors, list) else authors
            
            parsed_refs.append(
                ParsedReference(
                    author=_extract_ris_authors(entry),
                    year=_extract_ris_year(entry),
                    title=_extract_ris_title(entry),
                    journal=_extract_ris_journal(entry),
                    doi=_extract_ris_doi(entry),
                    upload_datetime=now,
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