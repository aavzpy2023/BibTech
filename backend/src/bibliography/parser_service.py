import datetime
from typing import List, Optional
import re
import bibtexparser
from .schemas import ParsedReference
from .wos_parser import (
    parse_wos_authors_detail,
    parse_wos_countries,
    parse_wos_cited_references,
)


def _extract_bib_int(entry, key: str) -> Optional[int]:
    val = _extract_bib_field(entry, key)
    if val:
        match = re.search(r"\b(\d+)\b", str(val))
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                return None
    return None


def _extract_bib_field(entry, key: str) -> Optional[str]:
    target_keys = {
        key.lower(),
        key.lower().replace("_", "-"),
        key.lower().replace("-", "_"),
    }
    if key.lower() == "journal":
        target_keys.update(
            {"journaltitle", "booktitle", "series", "journal-iso"}
        )
    elif key.lower() == "title":
        target_keys.update({"booktitle", "ti"})
    elif key.lower() == "year":
        target_keys.update({"date", "py"})
    elif key.lower() == "abstract":
        target_keys.update({"ab"})
    elif key.lower() == "publisher":
        target_keys.update({"pu"})
    elif key.lower() == "language":
        target_keys.update({"la"})
    elif key.lower() == "keywords":
        target_keys.update(
            {"keyword", "kw", "author_keywords", "author-keywords", "de"}
        )
    elif key.lower() == "keywords_plus":
        target_keys.update(
            {"keywords-plus", "keywords_plus", "keywordsplus", "id"}
        )
    elif key.lower() == "research_areas":
        target_keys.update({"research-areas", "sc"})
    elif key.lower() == "web_of_science_categories":
        target_keys.update({"web-of-science-categories", "wc"})
    elif key.lower() == "funding_text":
        target_keys.update({"funding-text", "funding", "fx"})
    elif key.lower() == "journal_iso":
        target_keys.update({"journal-iso", "ji", "j9"})
    elif key.lower() == "oa_status":
        target_keys.update({"oa", "oa-status", "open_access"})
    elif key.lower() == "issn":
        target_keys.update({"sn", "eissn"})
    elif key.lower() == "volume":
        target_keys.update({"vl"})
    elif key.lower() == "issue":
        target_keys.update({"number", "is"})
    elif key.lower() == "pages":
        target_keys.update({"page", "bp", "ar"})
    elif key.lower() in ("times_cited", "times-cited"):
        target_keys.update({"tc", "times-cited", "times_cited"})
    elif key.lower() in ("cited_references_count", "cited-references-count"):
        target_keys.update(
            {"number-of-cited-references", "nr", "cr"}
        )

    val = None
    if isinstance(entry, dict):
        for k, v in entry.items():
            if str(k).lower() in target_keys:
                val = v
                break
    elif hasattr(entry, "fields_dict"):
        for k, v in entry.fields_dict.items():
            if str(k).lower() in target_keys:
                val = getattr(v, "value", str(v))
                break
    elif hasattr(entry, "fields"):
        for field in entry.fields:
            f_key = getattr(field, "key", None)
            if f_key and str(f_key).lower() in target_keys:
                val = getattr(field, "value", str(field))
                break
    elif hasattr(entry, key):
        val = getattr(entry, key)
    elif hasattr(entry, "get"):
        for tk in target_keys:
            try:
                v = entry.get(tk) or entry.get(tk.capitalize())
                if v is not None:
                    val = v
                    break
            except Exception:
                pass
    else:
        val = None

    if val is not None:
        if hasattr(val, "value"):
            val = val.value
        cleaned = str(val).strip()
        while (cleaned.startswith("{") and cleaned.endswith("}")) or (
            cleaned.startswith('"') and cleaned.endswith('"')
        ):
            cleaned = cleaned[1:-1].strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
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
        or entry.get("alternate_title1")
        or entry.get("alternate_title2")
        or entry.get("alternate_title3")
        or entry.get("source")
        or entry.get("SO")
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


def _parse_bib_authors_detail(entry) -> List[dict]:
    src = {}
    if isinstance(entry, dict):
        src = entry
    elif hasattr(entry, "fields_dict"):
        src = {k: getattr(v, "value", str(v)) for k, v in entry.fields_dict.items()}
    elif hasattr(entry, "fields"):
        src = {getattr(f, "key", ""): getattr(f, "value", "") for f in entry.fields}

    norm_entry = {str(k).lower(): v for k, v in src.items()}
    
    if "affiliation" not in norm_entry and "affiliations" in norm_entry:
        norm_entry["affiliation"] = norm_entry["affiliations"]
    if "author-email" not in norm_entry and "email" in norm_entry:
        norm_entry["author-email"] = norm_entry["email"]
    if "orcid-numbers" not in norm_entry and "orcid" in norm_entry:
        norm_entry["orcid-numbers"] = norm_entry["orcid"]

    details = parse_wos_authors_detail(norm_entry)
    
    affil_raw = _extract_bib_field(norm_entry, "affiliation")
    email_raw = _extract_bib_field(norm_entry, "email") or _extract_bib_field(norm_entry, "author-email")
    orcid_raw = _extract_bib_field(norm_entry, "orcid") or _extract_bib_field(norm_entry, "orcid-numbers")
    corr_addr = _extract_bib_field(norm_entry, "correspondence_address") or _extract_bib_field(norm_entry, "correspondence-address")

    if details and corr_addr:
        if not email_raw:
            corr_emails = re.findall(
                r"email:\s*([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", 
                str(corr_addr), re.IGNORECASE
            )
            if corr_emails:
                email_raw = ",".join(corr_emails)
        for d in details:
            last_name = d["name"].split(",")[0].strip()
            if last_name and last_name.lower() in str(corr_addr).lower():
                d["is_corresponding"] = True

    if details:
        if affil_raw and all(not d.get("affiliation") for d in details):
            affils = [a.strip() for a in str(affil_raw).replace("\n", " ").split(";") if a.strip()]
            if len(affils) == len(details):
                for idx, d in enumerate(details):
                    d["affiliation"] = affils[idx]
            else:
                for d in details:
                    d["affiliation"] = affils[0] if len(affils) == 1 else " ; ".join(affils)
                    
        for d in details:
            if d.get("affiliation") and not d.get("country"):
                ext_parts = [p.strip() for p in d["affiliation"].split(",")]
                if ext_parts:
                    c_clean = re.sub(r"[0-9\-]", "", ext_parts[-1].rstrip(".")).strip()
                    if "USA" in c_clean.upper():
                        d["country"] = "USA"
                    elif "CHINA" in c_clean.upper():
                        d["country"] = "China"
                    elif "UK" in c_clean.upper() or "ENGLAND" in c_clean.upper():
                        d["country"] = "UK"
                    elif c_clean:
                        d["country"] = c_clean
                        
                    dept_kws = re.compile(
                        r"\b(Dept|Department|Sch|School|Fac|Faculty|Lab|Laboratory|Ctr|Center|Centre|Div|Division)\b", 
                        re.IGNORECASE
                    )
                    for p in ext_parts:
                        if dept_kws.search(p):
                            d["department"] = p
                            break

        if email_raw and all(not d.get("email") for d in details):
            emails = re.findall(
                r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", 
                str(email_raw)
            )
            if len(emails) == len(details):
                for idx, d in enumerate(details):
                    d["email"] = emails[idx]
            elif emails:
                corr = [d for d in details if d.get("is_corresponding")]
                targets = corr if corr else details
                for idx, e in enumerate(emails):
                    if idx < len(targets):
                        targets[idx]["email"] = e

        if orcid_raw and all(not d.get("orcid") for d in details):
            orcids = re.findall(r"([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])", str(orcid_raw), flags=re.IGNORECASE)
            if len(orcids) == len(details):
                for idx, d in enumerate(details):
                    d["orcid"] = orcids[idx].upper()
            elif len(orcids) == 1:
                details[0]["orcid"] = orcids[0].upper()
                
    return details


def _parse_bib_countries(entry) -> List[str]:
    src = {}
    if isinstance(entry, dict):
        src = entry
    elif hasattr(entry, "fields_dict"):
        src = {k: getattr(v, "value", str(v)) for k, v in entry.fields_dict.items()}
    elif hasattr(entry, "fields"):
        src = {getattr(f, "key", ""): getattr(f, "value", "") for f in entry.fields}
    
    norm_entry = {str(k).lower(): v for k, v in src.items()}
    if "affiliation" not in norm_entry and "affiliations" in norm_entry:
        norm_entry["affiliation"] = norm_entry["affiliations"]
        
    c = parse_wos_countries(norm_entry)
    if not c:
        affil_raw = _extract_bib_field(norm_entry, "affiliation")
        if affil_raw:
            c_set = set()
            for line in re.split(r";|\n", str(affil_raw)):
                ext_parts = [p.strip() for p in line.split(",")]
                if ext_parts:
                    c_clean = re.sub(r"[0-9\-]", "", ext_parts[-1].rstrip(".")).strip()
                    if "USA" in c_clean.upper():
                        c_set.add("USA")
                    elif "CHINA" in c_clean.upper():
                        c_set.add("China")
                    elif "UK" in c_clean.upper() or "ENGLAND" in c_clean.upper():
                        c_set.add("UK")
                    elif c_clean:
                        c_set.add(c_clean)
            c = sorted(list(c_set))
    return c


def parse_bibliography_content(content: str, ext: str) -> List[ParsedReference]:
    if ext.lower() != ".bib":
        raise ValueError(f"Unsupported extension: {ext}")
        
    now = datetime.datetime.now(datetime.timezone.utc)
    try:
        entries = _parse_bibtex_entries(content)
    except Exception:
        entries = []
        
    if not entries:
        raise ValueError("No se encontraron items válidos en el archivo .bib")
        
    return [
        ParsedReference(
            author=_extract_bib_field(entry, "author"),
            year=_extract_bib_field(entry, "year"),
            title=_extract_bib_field(entry, "title"),
            journal=_extract_bib_field(entry, "journal"),
            doi=_extract_bib_field(entry, "doi"),
            abstract=_extract_bib_field(entry, "abstract"),
            publisher=_extract_bib_field(entry, "publisher"),
            language=_extract_bib_field(entry, "language"),
            keywords=_extract_bib_field(entry, "keywords"),
            keywords_plus=_extract_bib_field(entry, "keywords_plus"),
            research_areas=_extract_bib_field(entry, "research_areas"),
            web_of_science_categories=_extract_bib_field(
                entry, "web_of_science_categories"
            ),
            funding_text=_extract_bib_field(entry, "funding_text"),
            journal_iso=_extract_bib_field(entry, "journal_iso"),
            oa_status=_extract_bib_field(entry, "oa_status"),
            issn=_extract_bib_field(entry, "issn"),
            volume=_extract_bib_field(entry, "volume"),
            issue=_extract_bib_field(entry, "issue"),
            pages=_extract_bib_field(entry, "pages"),
            times_cited=_extract_bib_int(entry, "times_cited"),
            cited_references_count=_extract_bib_int(
                entry, "cited_references_count"
            ),
            authors_detail=_parse_bib_authors_detail(
                entry if isinstance(entry, dict) else getattr(entry, "fields_dict", {})
            ),
            countries=_parse_bib_countries(
                entry if isinstance(entry, dict) else getattr(entry, "fields_dict", {})
            ),
            cited_references=parse_wos_cited_references(
                entry if isinstance(entry, dict) else getattr(entry, "fields_dict", {})
            ),
            upload_datetime=now,
        )
        for entry in entries
    ]


def _deprecated_parse_bibliography_content(content: str, ext: str) -> List[ParsedReference]:
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
        try:
            entries = _parse_bibtex_entries(content)
        except Exception:
            entries = []
            
        for entry in entries:
            parsed_refs.append(
                ParsedReference(
                    author=_extract_bib_field(entry, "author"),
                    year=_extract_bib_field(entry, "year"),
                    title=_extract_bib_field(entry, "title"),
                    journal=_extract_bib_field(entry, "journal"),
                    doi=_extract_bib_field(entry, "doi"),
                    upload_datetime=now,
                )
            )
    else:
        raise ValueError(f"Unsupported extension: {ext}")
        
    return parsed_refs