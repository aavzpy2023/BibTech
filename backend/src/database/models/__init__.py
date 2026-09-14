"""Database models package."""
from src.database.models.core import Article, Project, ProjectArticle
from src.database.models.identity import (
    Affiliation,
    Author,
    AuthorArticle,
    Keyword,
    KeywordArticle,
)

__all__ = [
    "Affiliation",
    "Article",
    "Author",
    "AuthorArticle",
    "Keyword",
    "KeywordArticle",
    "Project",
    "ProjectArticle",
]