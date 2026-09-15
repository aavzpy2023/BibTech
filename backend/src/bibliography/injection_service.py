"""Service for persisting bibliographic references into the database."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

try:
    from .schemas import ParsedReference
    from ..database.models.core import Article, Project, ProjectArticle
except (ImportError, ValueError):
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

    db.commit()
    return len(refs)
