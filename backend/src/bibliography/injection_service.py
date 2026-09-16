"""Service for persisting bibliographic references into the database."""
import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

try:
    from .schemas import ParsedReference
    from ..database.models.core import Article, Project, ProjectArticle
    from ..database.models.identity import Author, AuthorArticle
except (ImportError, ValueError):
    from backend.src.bibliography.schemas import ParsedReference
    from backend.src.database.models.core import (
        Article,
        Project,
        ProjectArticle,
    )
    from backend.src.database.models.identity import (
        Author,
        AuthorArticle,
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

        new_articles_data.append(
            {
                "title": title_val,
                "journal": ref.journal,
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

    all_authors_raw = set()
    for ref in refs:
        if ref.author:
            for a_name in re.split(
                r"\s+and\s+", str(ref.author), flags=re.I
            ):
                clean = a_name.strip()[:255]
                if clean:
                    all_authors_raw.add(clean)

    if all_authors_raw:
        existing_authors = {
            auth.name: auth
            for auth in db.query(Author)
            .filter(Author.name.in_(all_authors_raw))
            .all()
        }
        new_authors = [
            {"name": name}
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

        author_articles_data = []
        seen_auth_links = set()
        for ref in refs:
            doi_val = (ref.doi or "").strip() or None
            title_val = (ref.title or "").strip() or "Untitled"
            art = existing_by_doi.get(doi_val) if doi_val else None
            if not art:
                art = existing_by_title.get(title_val)
            if not art or not ref.author:
                continue

            auth_list = [
                a.strip()[:255]
                for a in re.split(r"\s+and\s+", str(ref.author), flags=re.I)
                if a.strip()
            ]
            for idx, a_name in enumerate(auth_list):
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
                            "is_corresponding": False,
                        }
                    )
                    seen_auth_links.add((auth_obj.id, art.id))

        if author_articles_data:
            stmt_aa = _get_insert_stmt(AuthorArticle, db).values(
                author_articles_data
            )
            db.execute(stmt_aa)

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
