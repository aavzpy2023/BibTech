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

from ..session import Base


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
    downloads = relationship(
        "Download",
        back_populates="project",
        cascade="all, delete-orphan",
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
    publisher = Column(
        String(255),
        nullable=True,
        comment="Publisher or imprint name of the article",
    )
    language = Column(
        String(50),
        nullable=True,
        comment="Primary language of the publication",
    )
    keywords = Column(
        Text,
        nullable=True,
        comment="Raw keywords string extracted from bib data",
    )
    research_areas = Column(
        Text,
        nullable=True,
        comment="Research areas or Web of Science categories",
    )
    web_of_science_categories = Column(
        Text,
        nullable=True,
        comment="Specific Web of Science categorical metadata",
    )
    funding_text = Column(
        Text,
        nullable=True,
        comment="Funding acknowledgment text or grant information",
    )
    journal_iso = Column(
        String(255),
        nullable=True,
        comment="ISO abbreviation of the journal name",
    )
    oa_status = Column(
        String(50),
        nullable=True,
        comment="Open Access status indicator",
    )
    issn = Column(
        String(50),
        nullable=True,
        comment="International Standard Serial Number",
    )
    times_cited = Column(
        Integer,
        nullable=True,
        comment="Number of times the article has been cited globally",
    )
    cited_references_count = Column(
        Integer,
        nullable=True,
        comment="Number of references cited by this article",
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
    keyword_articles = relationship(
        "KeywordArticle",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    keyword_entities = relationship(
        "Keyword",
        secondary="keyword_articles",
        viewonly=True,
    )
    references = relationship(
        "Reference",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    funding = relationship(
        "Funding",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    downloads = relationship(
        "Download",
        back_populates="article",
        cascade="all, delete-orphan",
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