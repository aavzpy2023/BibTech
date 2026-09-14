"""Core relational database models for projects and articles."""
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from src.database.session import Base


class Project(Base):
    """Represents a research project containing bibliographies."""

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key integer identifier",
    )
    name = Column(
        String(255),
        nullable=False,
        comment="Project display and reference name",
    )
    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of the project",
    )
    hashed_password = Column(
        String(255),
        nullable=True,
        comment="Bcrypt hashed project password",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when the project was created",
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when the project was last updated",
    )

    project_articles = relationship(
        "ProjectArticle",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    articles = relationship(
        "Article",
        secondary="project_articles",
        back_populates="projects",
        viewonly=True,
    )


class Article(Base):
    """Represents an academic publication with bibliographic data."""

    __tablename__ = "articles"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key integer identifier",
    )
    doi = Column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
        comment="Normalized DOI unique key",
    )
    title = Column(
        Text,
        nullable=False,
        comment="Full title of the article or publication",
    )
    journal = Column(
        String(255),
        nullable=True,
        comment="Journal or venue publishing the article",
    )
    year = Column(
        Integer,
        nullable=True,
        comment="Publication calendar year",
    )
    volume = Column(
        String(50),
        nullable=True,
        comment="Journal publication volume",
    )
    issue = Column(
        String(50),
        nullable=True,
        comment="Journal publication issue",
    )
    pages = Column(
        String(50),
        nullable=True,
        comment="Article page range or article number",
    )
    abstract = Column(
        Text,
        nullable=True,
        comment="Full text abstract of the article",
    )
    raw_data = Column(
        Text,
        nullable=True,
        comment="Raw bibliographic payload (e.g. BibTeX or RIS)",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when article was ingested",
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when article record was updated",
    )

    project_articles = relationship(
        "ProjectArticle",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    projects = relationship(
        "Project",
        secondary="project_articles",
        back_populates="articles",
        viewonly=True,
    )
    author_articles = relationship(
        "AuthorArticle",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    authors = relationship(
        "Author",
        secondary="author_articles",
        back_populates="articles",
        viewonly=True,
    )


class ProjectArticle(Base):
    """Junction model connecting projects to articles."""

    __tablename__ = "project_articles"
    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "article_id",
            name="uq_project_article",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key junction identifier",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to projects.id",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to articles.id",
    )
    status = Column(
        String(50),
        default="pending",
        nullable=False,
        comment="Processing or download status of the article in the project",
    )
    added_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when article was associated with project",
    )

    project = relationship("Project", back_populates="project_articles")
    article = relationship("Article", back_populates="project_articles")