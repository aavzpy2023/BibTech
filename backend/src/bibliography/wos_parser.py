import re
from typing import List, Dict, Any


def _normalize_name(name: str) -> str:
    """Normalize names for fuzzy matching by removing non-alpha chars."""
    return re.sub(r"[^a-zA-Z]", "", name).lower()


def parse_wos_authors_detail(entry: dict) -> List[Dict[str, Any]]:
    """
    Parses chaotic WOS identity fields (ORCID, ResearcherID, Affiliation) 
    and cross-references them to build a structured list of authors.
    """
    raw_authors = ""
    for k, v in entry.items():
        if k.lower() == "author":
            raw_authors = v
            break

    if not raw_authors:
        return []

    author_names = [
        a.strip() for a in re.split(r"\s+and\s+", str(raw_authors)) if a.strip()
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
    orcid_raw = entry.get("orcid-numbers", "") or entry.get("orcid_numbers", "")
    for line in str(orcid_raw).replace(";", "\n").split("\n"):
        if "/" in line:
            n_part, i_part = line.rsplit("/", 1)
            n_norm = _normalize_name(n_part)
            for d in details:
                d_norm = _normalize_name(d["name"])
                if d_norm.startswith(n_norm) or n_norm.startswith(d_norm):
                    d["orcid"] = i_part.strip()

    # 2. Process ResearcherID
    rid_raw = entry.get("researcherid-numbers", "") or entry.get("researcherid", "")
    for line in str(rid_raw).replace(";", "\n").split("\n"):
        if "/" in line:
            n_part, i_part = line.rsplit("/", 1)
            n_norm = _normalize_name(n_part)
            for d in details:
                d_norm = _normalize_name(d["name"])
                if d_norm.startswith(n_norm) or n_norm.startswith(d_norm):
                    d["researcher_id"] = i_part.strip()

    # 3. Process Affiliations & Corresponding Author
    affil_raw = entry.get("affiliation", "")
    for line in str(affil_raw).split("\n"):
        line = line.strip()
        if not line:
            continue
        
        is_corr = "(Corresponding Author)" in line
        line_clean = line.replace("(Corresponding Author)", "").strip()
        
        matched_authors = []
        for d in details:
            # Simple heuristic: check if author's last name is in the affiliation line
            last_name = d["name"].split(",")[0].strip()
            if last_name and last_name in line_clean:
                matched_authors.append(d)
                if is_corr:
                    d["is_corresponding"] = True
        
        for d in matched_authors:
            if not d["affiliation"]:
                d["affiliation"] = line_clean

    # 4. Process Emails (Attach to corresponding, or first author)
    email_raw = entry.get("author-email", "") or entry.get("author_email", "")
    emails = [e.strip() for e in str(email_raw).split(",") if e.strip()]
    
    corr_authors = [d for d in details if d["is_corresponding"]]
    if not corr_authors and details:
        corr_authors = [details[0]]
        
    for idx, email in enumerate(emails):
        if idx < len(corr_authors):
            corr_authors[idx]["email"] = email
        elif idx < len(details):
            details[idx]["email"] = email

    return details