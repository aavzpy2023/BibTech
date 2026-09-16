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


def inject_references_to_db(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    try:
        return _inject_references_inner(db, refs, project_code)
    except OperationalError:
        raise RuntimeError("Database connection failed")


def _inject_references_inner(
    db: Session, refs: List[ParsedReference], project_code: str
) -> int:
    """Persist parsed references and associate them with a project."""
    project = db.query(Project).filter(Project.name == project_code).first()
    if not project:
        project = Project(name=project_code)
        db.add(project)
        db.flush()

    linked_article_ids = set()

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

        link = db.query(ProjectArticle).filter(
            ProjectArticle.project_id == project.id,
            ProjectArticle.article_id == article.id
        ).first()
        
        if not link:
            db.add(ProjectArticle(project_id=project.id, article_id=article.id))

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
                a_link = (
                    db.query(AuthorArticle)
                    .filter(
                        AuthorArticle.author_id == auth_obj.id,
                        AuthorArticle.article_id == article.id,
                    )
                    .first()
                )
                if not a_link:
                    db.add(
                        AuthorArticle(
                            author_id=auth_obj.id,
                            article_id=article.id,
                            author_order=idx + 1,
                        )
                    )

    db.commit()
    return len(linked_article_ids)
