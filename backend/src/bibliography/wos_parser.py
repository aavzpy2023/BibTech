import re
from typing import List, Dict, Any


def _normalize_name(name: str) -> str:
    """Normalize names for fuzzy matching by removing non-alpha chars."""
    return re.sub(r"[^a-zA-Z]", "", name).lower()


def split_affiliation_blocks(raw_affil: str) -> List[str]:
    """
    Universally splits bibliographic affiliation blocks for both:
    - Scopus: Institutions separated by ';' (e.g. 'Inst 1, Country; Inst 2, Country')
    - WoS: Institutions separated by '.' followed by newline/next entity
    Preserves author names separated by ';' inside WoS lines.
    """
    if not raw_affil or not str(raw_affil).strip():
        return []

    text = str(raw_affil).strip()
    inst_kw = re.compile(
        r"\b(Univ|University|Inst|Institute|Dept|Department|Fac|Faculty|"
        r"Sch|School|Ctr|Center|Centre|Hospital|Coll|College|Lab|Laboratory|"
        r"Academy|Campus|Ministry|Division|Div)\b",
        re.IGNORECASE,
    )

    # 1. WoS check: Lines ending with a period followed by newline or next entity
    # In WoS, each affiliation line terminates with a period (e.g. '..., India.\n   Author, ...')
    wos_candidates = [
        s.strip().rstrip(".")
        for s in re.split(r"\.\s*\r?\n+\s*|\.\s+(?=[A-Z\[])", text)
        if s.strip()
    ]
    if len(wos_candidates) > 1:
        return wos_candidates

    # 2. Scopus check: Distinct institutions separated by ';'
    if ";" in text:
        scopus_candidates = [
            s.strip().rstrip(".") for s in text.split(";") if s.strip()
        ]
        if len(scopus_candidates) > 1:
            return scopus_candidates

    newline_candidates = [
        s.strip().rstrip(".") for s in text.splitlines() if s.strip()
    ]
    if len(newline_candidates) > 1:
        return newline_candidates

    return [text.rstrip(".")]


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

    affil_raw = get_val("affiliation", "affiliations")
    if not affil_raw:
        return []
        
    countries = set()
    lines = split_affiliation_blocks(affil_raw)
    
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
    kw_pattern = re.compile(
        r"\b(Univ|University|Inst|Institute|Sch|School|Dept|Department|Ctr|Center|Centre|"
        r"Fac|Faculty|Lab|Laboratory|Hosp|Hospital|Coll|College|Academy|Corp|Corporation|"
        r"Inc|Ltd|GmbH|LLC|Ministry|Div|Division|Agency|Natl|National|Hlth|Health|Biol|Biology|"
        r"Chem|Chemistry|Phys|Physics|Med|Medicine|Medical|Engn|Engineering|Tech|Technology|"
        r"Sci|Science|Sciences|Stat|Statistics|Observ|Observatory|Polytech|Polytechnic|Foundation)\b", 
        re.IGNORECASE
    )

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

    raw_authors = re.sub(r"\s+", " ", raw_authors)

    author_names = [
        a.strip() for a in re.split(r"\s+and\s+", raw_authors, flags=re.IGNORECASE) if a.strip()
    ]
    
    details = []
    for name in author_names:
        details.append({
            "name": name,
            "email": None,
            "orcid": None,
            "researcher_id": None,
            "affiliation": None,
            "department": None,
            "country": None,
            "is_corresponding": False
        })

    def match_author(d_name: str, n_name: str) -> bool:
        d_norm = _normalize_name(d_name)
        n_norm = _normalize_name(n_name)
        if not d_norm or not n_norm:
            return False
        if d_norm.startswith(n_norm) or n_norm.startswith(d_norm):
            return True
        d_parts = [p.strip() for p in d_name.split(",")]
        n_parts = [p.strip() for p in n_name.split(",")]
        if len(d_parts) > 0 and len(n_parts) > 0:
            d_last = _normalize_name(d_parts[0])
            n_last = _normalize_name(n_parts[0])
            if d_last and d_last == n_last:
                if len(d_parts) > 1 and len(n_parts) > 1:
                    d_first = _normalize_name(d_parts[1])
                    n_first = _normalize_name(n_parts[1])
                    if d_first and n_first and d_first[0] == n_first[0]:
                        return True
                else:
                    return True
        return False

    # 1. Process ORCID
    orcid_raw = get_val("orcid-numbers", "orcid_numbers")
    for match in re.finditer(
        r"([^/]+?)/([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])", 
        orcid_raw, 
        flags=re.IGNORECASE
    ):
        n_part = re.sub(r"^[\s;,]+", "", match.group(1)).strip()
        i_part = match.group(2).upper()
        for d in details:
            if match_author(d["name"], n_part):
                d["orcid"] = i_part
                break

    # 2. Process ResearcherID
    rid_raw = get_val("researcherid-numbers", "researcherid")
    for line in rid_raw.replace(";", "\n").split("\n"):
        if "/" in line:
            n_part, i_part = line.rsplit("/", 1)
            for d in details:
                if match_author(d["name"], n_part):
                    d["researcher_id"] = i_part.strip()
                    break

    # 3. Process Affiliations & Corresponding Author
    affil_raw = get_val("affiliation", "affiliations")
    lines = split_affiliation_blocks(affil_raw)
    
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
        if bracket_match:
            inst_part = bracket_match.group(2).strip()
        else:
            inst_part = line_clean
            
            if ";" in inst_part:
                segments = [s.strip() for s in inst_part.split(";")]
                for i, seg in enumerate(segments):
                    if kw_pattern.search(seg):
                        inst_part = "; ".join(segments[i:]).strip()
                        break
            
            subparts = [p.strip() for p in inst_part.split(",")]
            if len(subparts) >= 2:
                if not kw_pattern.search(subparts[0]) and kw_pattern.search(subparts[1]):
                    inst_part = ", ".join(subparts[1:]).strip()
                elif len(subparts) >= 3 and not kw_pattern.search(subparts[0]) and not kw_pattern.search(subparts[1]):
                    inst_part = ", ".join(subparts[2:]).strip()
                    
        dept_val = None
        country_val = None
        ext_parts = [p.strip() for p in line_clean.split(",")]
        if ext_parts:
            c_clean = re.sub(r"[0-9\-]", "", ext_parts[-1].rstrip(".")).strip()
            if "USA" in c_clean.upper():
                country_val = "USA"
            elif "CHINA" in c_clean.upper():
                country_val = "China"
            elif "UK" in c_clean.upper() or "ENGLAND" in c_clean.upper():
                country_val = "UK"
            elif c_clean:
                country_val = c_clean
            dept_kws = re.compile(
                r"\b(Dept|Department|Sch|School|Fac|Faculty|Lab|Laboratory|"
                r"Ctr|Center|Centre|Div|Division)\b", re.IGNORECASE
            )
            for p in ext_parts:
                if dept_kws.search(p):
                    dept_val = p
                    break

        for d in matched_authors:
            if not d["affiliation"]:
                d["affiliation"] = inst_part
                d["department"] = dept_val
                d["country"] = country_val

    # 4. Process Emails (Attach to corresponding, or first author)
    email_raw = get_val("author-email", "author_email")
    emails = re.findall(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", 
        str(email_raw)
    )
    
    corr_authors = [d for d in details if d["is_corresponding"]]
    if not corr_authors and details:
        corr_authors = [details[0]]
        
    for idx, email in enumerate(emails):
        if idx < len(corr_authors):
            corr_authors[idx]["email"] = email
        elif idx < len(details):
            details[idx]["email"] = email

    return details


def parse_funding_text(text: str) -> List[Dict[str, Optional[str]]]:
    """
    Parses unstructured funding acknowledgment text into structured grants.
    Extracts agency name, grant or award identification number, and country.
    """
    if not text or not str(text).strip():
        return []

    clean = re.sub(r"\s+", " ", str(text).strip())

    preambles = [
        r"^this (work|research|study|project|paper) (was|is) (supported|funded|aided) by (the )?",
        r"^supported by (the )?",
        r"^funded by (the )?",
        r"^we (thank|acknowledge) (the )?",
        r"^financial support (from|by) (the )?",
    ]
    trimmed = clean
    for p in preambles:
        trimmed = re.sub(p, "", trimmed, flags=re.IGNORECASE).strip()

    raw_segments = [
        s.strip()
        for s in re.split(r";|\.\s+(?=[A-Z\[])", trimmed)
        if s.strip()
    ]
    if not raw_segments:
        raw_segments = [trimmed]

    known_countries = [
        "USA", "United States", "China", "UK", "United Kingdom", "England",
        "Germany", "France", "Japan", "Canada", "Australia", "Spain", "Italy",
        "Brazil", "India", "South Korea", "Korea", "Netherlands", "Switzerland",
        "Sweden", "Poland", "Belgium", "Austria", "Malaysia", "Singapore",
        "Mexico", "Chile", "Argentina", "Colombia", "Portugal", "Norway",
        "Denmark", "Finland", "Taiwan", "Saudi Arabia"
    ]
    country_pat = re.compile(
        r"\b(" + "|".join(re.escape(c) for c in known_countries) + r")\b",
        re.IGNORECASE,
    )
    grant_prefix_pat = re.compile(
        r"(?:grant|award|contract|project|agreement|number|no\.?|#)\s*[:#]?\s*",
        re.IGNORECASE,
    )

    results: List[Dict[str, Optional[str]]] = []

    for seg in raw_segments:
        seg_clean = seg.rstrip(".").strip()
        if not seg_clean or len(seg_clean) < 3:
            continue

        detected_country = None
        c_matches = country_pat.findall(seg_clean)
        if c_matches:
            detected_country = c_matches[-1]

        bracket_matches = list(re.finditer(r"[\(\[](.*?)[\)\]]", seg_clean))

        if bracket_matches:
            first_m = bracket_matches[0]
            agency = seg_clean[: first_m.start()].strip()
            agency = re.sub(
                r",?\s*(under|through|via|with|by)\s*$",
                "",
                agency,
                flags=re.IGNORECASE,
            ).strip(", -:")

            for bm in bracket_matches:
                inside = bm.group(1).strip()
                inside_clean = grant_prefix_pat.sub("", inside).strip()
                grants = [
                    g.strip()
                    for g in re.split(r"[,;]\s*", inside_clean)
                    if g.strip()
                ]
                for g in grants:
                    if len(g) > 2 and not g.lower().startswith("http"):
                        if re.match(r"^[A-Z]{2,6}$", g) and not re.search(r"\d", g):
                            if agency:
                                agency = f"{agency} ({g})"
                            continue
                        results.append({
                            "agency": (agency or seg_clean)[:255],
                            "grant_number": g[:100],
                            "country": (
                                detected_country[:100]
                                if detected_country
                                else None
                            ),
                        })

            if not any(r.get("agency") == agency[:255] for r in results) and agency:
                results.append({
                    "agency": agency[:255],
                    "grant_number": None,
                    "country": (
                        detected_country[:100]
                        if detected_country
                        else None
                    ),
                })
        else:
            g_match = re.search(
                r"(?:grant|award|contract|no\.?)\s*[:#]?\s*([A-Z0-9\/\-_]+)",
                seg_clean,
                re.IGNORECASE,
            )
            grant_code = g_match.group(1) if g_match else None
            agency = seg_clean
            if g_match:
                agency = seg_clean[: g_match.start()].strip()
                agency = re.sub(
                    r",?\s*(under|through|via|with|by)\s*$",
                    "",
                    agency,
                    flags=re.IGNORECASE,
                ).strip()

            agency = agency.strip(", -:")
            if detected_country and agency.lower().endswith(detected_country.lower()):
                agency = re.sub(
                    r",?\s*" + re.escape(detected_country) + r"$",
                    "",
                    agency,
                    flags=re.IGNORECASE,
                ).strip()

            if len(agency) >= 3:
                results.append({
                    "agency": agency[:255],
                    "grant_number": grant_code[:100] if grant_code else None,
                    "country": (
                        detected_country[:100]
                        if detected_country
                        else None
                    ),
                })

    unique_results: List[Dict[str, Optional[str]]] = []
    seen = set()
    for r in results:
        key = (r["agency"].lower(), (r["grant_number"] or "").lower())
        if key not in seen and len(r["agency"]) >= 3:
            seen.add(key)
            unique_results.append(r)

    return unique_results