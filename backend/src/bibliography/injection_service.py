"""Service for persisting bibliographic references into the database."""
import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

try:
    from .schemas import ParsedReference
    from ..database.models.core import (
        Article,
        Project,
        ProjectArticle,
        Country,
        ArticleCountry,
        CitedReference,
        ArticleCitation,
        Journal,
    )
    from ..database.models.identity import (
        Author,
        AuthorArticle,
        Affiliation,
        Keyword,
        KeywordArticle,
    )
except (ImportError, ValueError):
    from backend.src.bibliography.schemas import ParsedReference
    from backend.src.database.models.core import (
        Article,
        Project,
        ProjectArticle,
        Country,
        ArticleCountry,
        CitedReference,
        ArticleCitation,
        Journal,
    )
    from backend.src.database.models.identity import (
        Author,
        AuthorArticle,
        Affiliation,
        Keyword,
        KeywordArticle,
    )
    from backend.src.bibliography.schemas import ParsedReference
    from backend.src.database.models.core import (
        Article,
        Project,
        ProjectArticle,
    )


def _get_insert_stmt(table_or_model, db: Session):
    dialect_name = ""
    try:
        if db.bind:
            dialect_name = db.bind.dialect.name
    except Exception:
        pass
    if dialect_name == "postgresql":
        from sqlalchemy.dialects.postgresql import insert as pg_insert

        return pg_insert(table_or_model).on_conflict_do_nothing()
    from sqlalchemy.dialects.sqlite import insert as sqlite_insert

    return sqlite_insert(table_or_model).on_conflict_do_nothing()


def _bulk_inject_references(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    """Persist parsed references and associate them with a project in bulk."""
    project = db.query(Project).filter(Project.name == project_code).first()
    if not project:
        project = Project(name=project_code)
        db.add(project)
        db.flush()

    if not refs:
        db.commit()
        return 0

    all_dois = {
        ref.doi.strip()
        for ref in refs
        if ref.doi and ref.doi.strip()
    }
    all_titles = {
        ref.title.strip()
        for ref in refs
        if ref.title and ref.title.strip()
    }

    existing_by_doi = {}
    if all_dois:
        for a in db.query(Article).filter(Article.doi.in_(all_dois)).all():
            if a.doi:
                existing_by_doi[a.doi] = a

    existing_by_title = {}
    if all_titles:
        for a in (
            db.query(Article).filter(Article.title.in_(all_titles)).all()
        ):
            if a.title:
                existing_by_title[a.title] = a

    # 0. Bulk inject Journals
    all_journals = set()
    for ref in refs:
        if ref.journal and ref.journal.strip():
            all_journals.add(ref.journal.strip()[:255])
            
    existing_journals = {}
    if all_journals:
        for j in db.query(Journal).filter(Journal.name.in_(all_journals)).all():
            existing_journals[j.name] = j.id
            
        new_journals = [
            {"name": j_name}
            for j_name in all_journals
            if j_name not in existing_journals
        ]
        if new_journals:
            stmt_j = _get_insert_stmt(Journal, db).values(new_journals)
            db.execute(stmt_j)
            for j in db.query(Journal).filter(Journal.name.in_(all_journals)).all():
                existing_journals[j.name] = j.id

    seen_batch_dois = set()
    seen_batch_titles = set()
    new_articles_data = []

    for ref in refs:
        doi_val = (ref.doi or "").strip() or None
        title_val = (ref.title or "").strip() or "Untitled"

        if doi_val:
            if doi_val in seen_batch_dois or doi_val in existing_by_doi:
                continue
            seen_batch_dois.add(doi_val)
        else:
            if (
                title_val in seen_batch_titles
                or title_val in existing_by_title
            ):
                continue
            seen_batch_titles.add(title_val)

        year_val: Optional[int] = None
        if ref.year:
            try:
                year_val = int(float(str(ref.year).strip()))
            except (ValueError, TypeError):
                year_val = None

        j_name = ref.journal.strip()[:255] if ref.journal else None
        j_id = existing_journals.get(j_name) if j_name else None

        new_articles_data.append(
            {
                "title": title_val,
                "journal": ref.journal,
                "journal_id": j_id,
                "year": year_val,
                "doi": doi_val,
                "abstract": getattr(ref, "abstract", None),
                "publisher": getattr(ref, "publisher", None),
                "language": getattr(ref, "language", None),
                "research_areas": getattr(ref, "research_areas", None),
                "web_of_science_categories": getattr(
                    ref, "web_of_science_categories", None
                ),
                "funding_text": getattr(ref, "funding_text", None),
                "journal_iso": getattr(ref, "journal_iso", None),
                "oa_status": getattr(ref, "oa_status", None),
                "issn": getattr(ref, "issn", None),
                "volume": getattr(ref, "volume", None),
                "issue": getattr(ref, "issue", None),
                "pages": getattr(ref, "pages", None),
                "times_cited": getattr(ref, "times_cited", None),
                "cited_references_count": getattr(
                    ref, "cited_references_count", None
                ),
                "raw_data": getattr(ref, "raw_data", None) or (str(ref.author) if ref.author else None),
            }
        )

    if new_articles_data:
        stmt = _get_insert_stmt(Article, db).values(new_articles_data)
        db.execute(stmt)

    if all_dois:
        for a in db.query(Article).filter(Article.doi.in_(all_dois)).all():
            if a.doi:
                existing_by_doi[a.doi] = a

    if all_titles:
        for a in (
            db.query(Article).filter(Article.title.in_(all_titles)).all()
        ):
            if a.title:
                existing_by_title[a.title] = a

    linked_article_ids = set()
    project_articles_data = []
    seen_proj_links = set(
        (
            pa.project_id,
            pa.article_id,
        )
        for pa in db.query(ProjectArticle)
        .filter(ProjectArticle.project_id == project.id)
        .all()
    )

    for ref in refs:
        doi_val = (ref.doi or "").strip() or None
        title_val = (ref.title or "").strip() or "Untitled"
        art = existing_by_doi.get(doi_val) if doi_val else None
        if not art:
            art = existing_by_title.get(title_val)

        if art:
            linked_article_ids.add(art.id)
            if (project.id, art.id) not in seen_proj_links:
                project_articles_data.append(
                    {
                        "project_id": project.id,
                        "article_id": art.id,
                        "status": "pending",
                    }
                )
                seen_proj_links.add((project.id, art.id))

    if project_articles_data:
        stmt_pa = _get_insert_stmt(ProjectArticle, db).values(
            project_articles_data
        )
        db.execute(stmt_pa)

    # 1. Bulk inject affiliations from authors_detail
    all_affils_map = {}
    for ref in refs:
        if getattr(ref, "authors_detail", None):
            for ad in ref.authors_detail:
                aff = ad.get("affiliation")
                if aff and str(aff).strip():
                    inst_str = str(aff).strip()[:255]
                    if inst_str not in all_affils_map:
                        all_affils_map[inst_str] = {
                            "institution": inst_str,
                            "department": (ad.get("department") or "")[:255] or None,
                            "country": (ad.get("country") or "")[:100] or None,
                        }

    existing_affils = {}
    if all_affils_map:
        for aff in (
            db.query(Affiliation)
            .filter(Affiliation.institution.in_(list(all_affils_map.keys())))
            .all()
        ):
            existing_affils[aff.institution] = aff.id
        
        new_affils = [
            all_affils_map[inst]
            for inst in all_affils_map.keys()
            if inst not in existing_affils
        ]
        if new_affils:
            stmt_aff = _get_insert_stmt(Affiliation, db).values(new_affils)
            db.execute(stmt_aff)
            for aff in (
                db.query(Affiliation)
                .filter(Affiliation.institution.in_(list(all_affils_map.keys())))
                .all()
            ):
                existing_affils[aff.institution] = aff.id

    # 2. Extract author metadata map (ORCID, email, affiliation_id)
    author_info_map = {}
    all_authors_raw = set()
    for ref in refs:
        if getattr(ref, "authors_detail", None):
            for ad in ref.authors_detail:
                name = (ad.get("name") or "").strip()[:255]
                if name:
                    all_authors_raw.add(name)
                    aff_str = (ad.get("affiliation") or "").strip()[:255]
                    aff_id = existing_affils.get(aff_str)
                    author_info_map[name] = {
                        "name": name,
                        "orcid": (ad.get("orcid") or "")[:50] or None,
                        "email": (ad.get("email") or "")[:255] or None,
                        "affiliation_id": aff_id,
                    }
        elif ref.author:
            for a_name in re.split(r"\s+and\s+", str(ref.author), flags=re.I):
                clean = a_name.strip()[:255]
                if clean:
                    all_authors_raw.add(clean)
                    if clean not in author_info_map:
                        author_info_map[clean] = {
                            "name": clean,
                            "orcid": None,
                            "email": None,
                            "affiliation_id": None,
                        }

    # 3. Bulk inject authors
    if all_authors_raw:
        existing_authors = {
            auth.name: auth
            for auth in db.query(Author)
            .filter(Author.name.in_(all_authors_raw))
            .all()
        }
        new_authors = [
            author_info_map.get(name, {"name": name})
            for name in all_authors_raw
            if name not in existing_authors
        ]
        if new_authors:
            stmt_auth = _get_insert_stmt(Author, db).values(new_authors)
            db.execute(stmt_auth)
            existing_authors = {
                auth.name: auth
                for auth in db.query(Author)
                .filter(Author.name.in_(all_authors_raw))
                .all()
            }

        # 4. Link authors to articles with corresponding flag
        author_articles_data = []
        seen_auth_links = set()
        for ref in refs:
            doi_val = (ref.doi or "").strip() or None
            title_val = (ref.title or "").strip() or "Untitled"
            art = existing_by_doi.get(doi_val) if doi_val else None
            if not art:
                art = existing_by_title.get(title_val)
            if not art:
                continue

            author_items = []
            if getattr(ref, "authors_detail", None):
                author_items = [
                    (
                        (ad.get("name") or "").strip()[:255],
                        bool(ad.get("is_corresponding", False)),
                    )
                    for ad in ref.authors_detail
                    if (ad.get("name") or "").strip()
                ]
            elif ref.author:
                author_items = [
                    (a.strip()[:255], False)
                    for a in re.split(r"\s+and\s+", str(ref.author), flags=re.I)
                    if a.strip()
                ]

            for idx, (a_name, is_corr) in enumerate(author_items):
                auth_obj = existing_authors.get(a_name)
                if (
                    auth_obj
                    and (auth_obj.id, art.id) not in seen_auth_links
                ):
                    author_articles_data.append(
                        {
                            "author_id": auth_obj.id,
                            "article_id": art.id,
                            "author_order": idx + 1,
                            "is_corresponding": is_corr,
                        }
                    )
                    seen_auth_links.add((auth_obj.id, art.id))

        if author_articles_data:
            stmt_aa = _get_insert_stmt(AuthorArticle, db).values(
                author_articles_data
            )
            db.execute(stmt_aa)

    # 5. Bulk inject keywords (Author Keywords and Keywords-Plus)
    all_keywords_to_process = set()
    for ref in refs:
        if ref.keywords:
            for kw in str(ref.keywords).split(";"):
                k_clean = kw.strip()[:255]
                if k_clean:
                    all_keywords_to_process.add((k_clean, "author"))
        if getattr(ref, "keywords_plus", None):
            for kw in str(ref.keywords_plus).split(";"):
                k_clean = kw.strip()[:255]
                if k_clean:
                    all_keywords_to_process.add((k_clean, "plus"))

    if all_keywords_to_process:
        kw_names = {k[0] for k in all_keywords_to_process}
        existing_kws = {
            (k.name, k.type): k.id
            for k in db.query(Keyword).filter(Keyword.name.in_(kw_names)).all()
        }
        new_kws = [
            {"name": name, "type": k_type}
            for name, k_type in all_keywords_to_process
            if (name, k_type) not in existing_kws
        ]
        if new_kws:
            stmt_kw = _get_insert_stmt(Keyword, db).values(new_kws)
            db.execute(stmt_kw)
            existing_kws = {
                (k.name, k.type): k.id
                for k in db.query(Keyword).filter(Keyword.name.in_(kw_names)).all()
            }

        keyword_articles_data = []
        seen_kw_links = set()
        for ref in refs:
            doi_val = (ref.doi or "").strip() or None
            title_val = (ref.title or "").strip() or "Untitled"
            art = existing_by_doi.get(doi_val) if doi_val else None
            if not art:
                art = existing_by_title.get(title_val)
            if not art:
                continue

            ref_kws = []
            if ref.keywords:
                for kw in str(ref.keywords).split(";"):
                    k_clean = kw.strip()[:255]
                    if k_clean:
                        ref_kws.append((k_clean, "author"))
            if getattr(ref, "keywords_plus", None):
                for kw in str(ref.keywords_plus).split(";"):
                    k_clean = kw.strip()[:255]
                    if k_clean:
                        ref_kws.append((k_clean, "plus"))

            for k_tuple in ref_kws:
                kw_id = existing_kws.get(k_tuple)
                if kw_id and (kw_id, art.id) not in seen_kw_links:
                    keyword_articles_data.append(
                        {"keyword_id": kw_id, "article_id": art.id}
                    )
                    seen_kw_links.add((kw_id, art.id))

        if keyword_articles_data:
            stmt_ka = _get_insert_stmt(KeywordArticle, db).values(
                keyword_articles_data
            )
            db.execute(stmt_ka)

    # 6. Bulk inject Countries
    all_countries = set()
    for ref in refs:
        if getattr(ref, "countries", None):
            for c in ref.countries:
                if c and str(c).strip():
                    all_countries.add(str(c).strip()[:100])
                    
    if all_countries:
        existing_countries = {
            c.name: c.id
            for c in db.query(Country).filter(Country.name.in_(all_countries)).all()
        }
        new_countries = [
            {"name": c_name}
            for c_name in all_countries
            if c_name not in existing_countries
        ]
        if new_countries:
            stmt_c = _get_insert_stmt(Country, db).values(new_countries)
            db.execute(stmt_c)
            existing_countries = {
                c.name: c.id
                for c in db.query(Country).filter(Country.name.in_(all_countries)).all()
            }
            
        article_countries_data = []
        seen_ac_links = set()
        for ref in refs:
            if not getattr(ref, "countries", None):
                continue
            doi_val = (ref.doi or "").strip() or None
            title_val = (ref.title or "").strip() or "Untitled"
            art = existing_by_doi.get(doi_val) if doi_val else None
            if not art:
                art = existing_by_title.get(title_val)
            if not art:
                continue
                
            for c in ref.countries:
                c_name = str(c).strip()[:100]
                c_id = existing_countries.get(c_name)
                if c_id and (art.id, c_id) not in seen_ac_links:
                    article_countries_data.append({
                        "article_id": art.id,
                        "country_id": c_id
                    })
                    seen_ac_links.add((art.id, c_id))
                    
        if article_countries_data:
            stmt_ac = _get_insert_stmt(ArticleCountry, db).values(article_countries_data)
            db.execute(stmt_ac)

    # 7. Bulk inject Cited References
    all_crs = {}
    for ref in refs:
        if getattr(ref, "cited_references", None):
            for cr in ref.cited_references:
                raw = cr.get("raw")
                if raw and str(raw).strip():
                    raw_clean = str(raw).strip()
                    all_crs[raw_clean] = {
                        "raw_string": raw_clean,
                        "author": (cr.get("author") or "")[:255] or None,
                        "year": int(cr.get("year")) if cr.get("year") and str(cr.get("year")).isdigit() else None,
                        "source": (cr.get("source") or "")[:255] or None,
                        "doi": (cr.get("doi") or "")[:255] or None,
                    }
                    
    if all_crs:
        existing_crs = {
            cr.raw_string: cr.id
            for cr in db.query(CitedReference).filter(CitedReference.raw_string.in_(all_crs.keys())).all()
        }
        new_crs = [
            cr_data
            for raw, cr_data in all_crs.items()
            if raw not in existing_crs
        ]
        if new_crs:
            stmt_cr = _get_insert_stmt(CitedReference, db).values(new_crs)
            db.execute(stmt_cr)
            existing_crs = {
                cr.raw_string: cr.id
                for cr in db.query(CitedReference).filter(CitedReference.raw_string.in_(all_crs.keys())).all()
            }
            
        article_citations_data = []
        seen_cr_links = set()
        for ref in refs:
            if not getattr(ref, "cited_references", None):
                continue
            doi_val = (ref.doi or "").strip() or None
            title_val = (ref.title or "").strip() or "Untitled"
            art = existing_by_doi.get(doi_val) if doi_val else None
            if not art:
                art = existing_by_title.get(title_val)
            if not art:
                continue
                
            for cr in ref.cited_references:
                raw = cr.get("raw")
                if not raw:
                    continue
                raw_clean = str(raw).strip()
                cr_id = existing_crs.get(raw_clean)
                if cr_id and (art.id, cr_id) not in seen_cr_links:
                    article_citations_data.append({
                        "article_id": art.id,
                        "cited_reference_id": cr_id
                    })
                    seen_cr_links.add((art.id, cr_id))
                    
        if article_citations_data:
            stmt_acr = _get_insert_stmt(ArticleCitation, db).values(article_citations_data)
            db.execute(stmt_acr)

    db.commit()
    return len(linked_article_ids)


def inject_references_to_db(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    try:
        return _bulk_inject_references(db, refs, project_code)
    except OperationalError:
        raise RuntimeError("Database connection failed")


def _inject_references_inner(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    """Persist parsed references and associate them with a project."""
    return _bulk_inject_references(db, refs, project_code)


def _legacy_inject_references_unused(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    project = db.query(Project).filter(Project.name == project_code).first()
    if not project:
        project = Project(name=project_code)
        db.add(project)
        db.flush()

    linked_article_ids = set()
    seen_proj_links = set()
    seen_auth_links = set()

    for ref in refs:
        year_val: Optional[int] = None
        if ref.year:
            try:
                year_val = int(float(str(ref.year).strip()))
            except (ValueError, TypeError):
                year_val = None

        doi_val = getattr(ref, "doi", None)
        article = None
        
        if doi_val:
            article = db.query(Article).filter(Article.doi == doi_val).first()
        if not article:
            title_val = ref.title or "Untitled"
            article = db.query(Article).filter(Article.title == title_val).first()
            
        if not article:
            article = Article(
                title=ref.title or "Untitled",
                journal=ref.journal,
                year=year_val,
                doi=doi_val,
            )
            db.add(article)
            db.flush()

        link = None
        if (project.id, article.id) not in seen_proj_links:
            link = db.query(ProjectArticle).filter(
                ProjectArticle.project_id == project.id,
                ProjectArticle.article_id == article.id
            ).first()
        
        if not link and (project.id, article.id) not in seen_proj_links:
            db.add(ProjectArticle(project_id=project.id, article_id=article.id))
            db.flush()
        seen_proj_links.add((project.id, article.id))

        linked_article_ids.add(article.id)

        if ref.author:
            if not getattr(article, "raw_data", None):
                article.raw_data = str(ref.author)
            auth_list = [
                a.strip()
                for a in re.split(r"\s+and\s+", str(ref.author), flags=re.I)
                if a.strip()
            ]
            for idx, a_name in enumerate(auth_list):
                c_name = a_name[:255]
                auth_obj = (
                    db.query(Author).filter(Author.name == c_name).first()
                )
                if not auth_obj:
                    auth_obj = Author(name=c_name)
                    db.add(auth_obj)
                    db.flush()
                a_link = None
                if (auth_obj.id, article.id) not in seen_auth_links:
                    a_link = (
                        db.query(AuthorArticle)
                        .filter(
                            AuthorArticle.author_id == auth_obj.id,
                            AuthorArticle.article_id == article.id,
                        )
                        .first()
                    )
                if not a_link and (auth_obj.id, article.id) not in seen_auth_links:
                    db.add(
                        AuthorArticle(
                            author_id=auth_obj.id,
                            article_id=article.id,
                            author_order=idx + 1,
                        )
                    )
                    db.flush()
                seen_auth_links.add((auth_obj.id, article.id))

    db.commit()
    return len(linked_article_ids)
