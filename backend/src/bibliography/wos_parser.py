import re
from typing import List, Dict, Any


def _normalize_name(name: str) -> str:
    """Normalize names for fuzzy matching by removing non-alpha chars."""
    return re.sub(r"[^a-zA-Z]", "", name).lower()


def parse_wos_countries(entry: dict) -> List[str]:
    """Extracts unique countries from the affiliation field."""
    def get_val(*keys):
        for k, v in entry.items():
            if str(k).lower() in keys:
                val = getattr(v, "value", v)
                if hasattr(val, "value"):
                    val = val.value
                s = str(val).strip()
                while (s.startswith("{") and s.endswith("}")) or (
                    s.startswith('"') and s.endswith('"')
                ):
                    s = s[1:-1].strip()
                return s
        return ""

    affil_raw = get_val("affiliation")
    if not affil_raw:
        return []
        
    countries = set()
    lines = [
        line.strip() 
        for line in re.split(r"\.\s+(?=[A-Z\[])|\n", affil_raw) 
        if line.strip()
    ]
    
    for line in lines:
        line_clean = re.sub(r"^\[.*?\]\s*", "", line).strip()
        if not line_clean:
            continue
        parts = [p.strip() for p in line_clean.split(",")]
        if parts:
            last_part = parts[-1].rstrip(".")
            country = re.sub(r"[0-9\-]", "", last_part).strip()
            if "USA" in country.upper():
                country = "USA"
            elif "CHINA" in country.upper():
                country = "China"
            elif "UK" in country.upper() or "ENGLAND" in country.upper():
                country = "UK"
            if country:
                countries.add(country)
                
    return sorted(list(countries))


def parse_wos_cited_references(entry: dict) -> List[Dict[str, str]]:
    """Parses cited references into structured dicts (author, year, source)."""
    def get_val(*keys):
        for k, v in entry.items():
            if str(k).lower() in keys:
                val = getattr(v, "value", v)
                if hasattr(val, "value"):
                    val = val.value
                s = str(val).strip()
                while (s.startswith("{") and s.endswith("}")) or (
                    s.startswith('"') and s.endswith('"')
                ):
                    s = s[1:-1].strip()
                return s
        return ""

    cr_raw = get_val("cited-references", "cited_references")
    if not cr_raw:
        return []

    parsed_crs = []
    cr_list = [cr.strip() for cr in re.split(r";|\n", cr_raw) if cr.strip()]
    
    for cr in cr_list:
        parts = [p.strip() for p in cr.split(",")]
        if not parts:
            continue
            
        author = parts[0] if len(parts) > 0 else ""
        year = ""
        source = ""
        
        if len(parts) > 1:
            if re.match(r"^\d{4}$", parts[1]):
                year = parts[1]
                source = ", ".join(parts[2:]) if len(parts) > 2 else ""
            else:
                source = ", ".join(parts[1:])
                
        doi = ""
        doi_match = re.search(r"(10\.\d{4,9}/[-._;()/:a-zA-Z0-9]+)", source)
        if doi_match:
            doi = doi_match.group(1).rstrip(".]}")
                
        parsed_crs.append({
            "author": author,
            "year": year,
            "source": source,
            "doi": doi,
            "raw": cr
        })
        
    unique_crs = {cr["raw"]: cr for cr in parsed_crs}
    return list(unique_crs.values())


def parse_wos_authors_detail(entry: dict) -> List[Dict[str, Any]]:
    """
    Parses chaotic WOS identity fields (ORCID, ResearcherID, Affiliation) 
    and cross-references them to build a structured list of authors.
    """
    def get_val(*keys):
        for k, v in entry.items():
            if str(k).lower() in keys:
                val = getattr(v, "value", v)
                if hasattr(val, "value"):
                    val = val.value
                s = str(val).strip()
                while (s.startswith("{") and s.endswith("}")) or (
                    s.startswith('"') and s.endswith('"')
                ):
                    s = s[1:-1].strip()
                return s
        return ""

    raw_authors = get_val("author")
    if not raw_authors:
        return []

    author_names = [
        a.strip() for a in re.split(r"\s+and\s+", raw_authors) if a.strip()
    ]
    
    details = []
    for name in author_names:
        details.append({
            "name": name,
            "email": None,
            "orcid": None,
            "researcher_id": None,
            "affiliation": None,
            "is_corresponding": False
        })

    # 1. Process ORCID
    orcid_raw = get_val("orcid-numbers", "orcid_numbers")
    for line in orcid_raw.replace(";", "\n").split("\n"):
        if "/" in line:
            n_part, i_part = line.rsplit("/", 1)
            n_norm = _normalize_name(n_part)
            for d in details:
                d_norm = _normalize_name(d["name"])
                if d_norm.startswith(n_norm) or n_norm.startswith(d_norm):
                    d["orcid"] = i_part.strip()

    # 2. Process ResearcherID
    rid_raw = get_val("researcherid-numbers", "researcherid")
    for line in rid_raw.replace(";", "\n").split("\n"):
        if "/" in line:
            n_part, i_part = line.rsplit("/", 1)
            n_norm = _normalize_name(n_part)
            for d in details:
                d_norm = _normalize_name(d["name"])
                if d_norm.startswith(n_norm) or n_norm.startswith(d_norm):
                    d["researcher_id"] = i_part.strip()

    # 3. Process Affiliations & Corresponding Author
    affil_raw = get_val("affiliation")
    affil_raw = affil_raw.replace("\n", " ")
    lines = [
        line.strip() 
        for line in re.split(r"\.\s+(?=[A-Z\[])", affil_raw) 
        if line.strip()
    ]
    
    for line in lines:
        is_corr = "(Corresponding Author)" in line or "(corresponding author)" in line.lower()
        line_clean = re.sub(r"\(\s*Corresponding\s*Author\s*\)", "", line, flags=re.I).strip()
        
        matched_authors = []
        for d in details:
            last_name = d["name"].split(",")[0].strip()
            if last_name and last_name.lower() in line_clean.lower():
                matched_authors.append(d)
                if is_corr:
                    d["is_corresponding"] = True
        
        bracket_match = re.match(r"^\[(.*?)\]\s*(.*)", line_clean)
        inst_part = bracket_match.group(2) if bracket_match else line_clean
        
        for d in matched_authors:
            if not d["affiliation"]:
                d["affiliation"] = inst_part

    # 4. Process Emails (Attach to corresponding, or first author)
    email_raw = get_val("author-email", "author_email")
    emails = [e.strip() for e in email_raw.split(",") if e.strip()]
    
    corr_authors = [d for d in details if d["is_corresponding"]]
    if not corr_authors and details:
        corr_authors = [details[0]]
        
    for idx, email in enumerate(emails):
        if idx < len(corr_authors):
            corr_authors[idx]["email"] = email
        elif idx < len(details):
            details[idx]["email"] = email

    return details