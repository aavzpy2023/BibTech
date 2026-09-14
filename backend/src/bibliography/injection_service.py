"""Service for persisting bibliographic references into the database."""
from typing import List, Optional
from sqlalchemy.orm import Session

try:
    from src.bibliography.schemas import ParsedReference
    from src.database.models.core import Article, Project, ProjectArticle
except ImportError:
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
        db.add(ProjectArticle(project=project, article=article))

    db.commit()
    return len(refs)