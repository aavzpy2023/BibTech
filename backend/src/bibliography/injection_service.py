"""Service for persisting bibliographic references into the database."""
from typing import List, Optional
from sqlalchemy.orm import Session

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

        article = Article(
            title=ref.title or "Untitled",
            journal=ref.journal,
            year=year_val,
        )
        db.add(article)
        db.flush()
        db.add(ProjectArticle(project_id=project.id, article_id=article.id))

    db.commit()
    return len(refs)
