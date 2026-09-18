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


class SourceDatabase(Base):
    """Dimensional table representing the original source database of the article."""

    __tablename__ = "source_databases"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key",
    )
    name = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    description = Column(
        String(255),
        nullable=True,
    )

    articles = relationship(
        "Article",
        back_populates="source_database",
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
    journal_id = Column(
        Integer,
        ForeignKey("journals.id", ondelete="SET NULL"),
        nullable=True,
        comment="Foreign key linking to journals table for dimensional modeling",
    )
    source_database_id = Column(
        Integer,
        ForeignKey("source_databases.id", ondelete="SET NULL"),
        nullable=True,
        comment="Source database dimensional foreign key",
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
    keywords = relationship(
        "Keyword",
        secondary="keyword_articles",
        back_populates="articles",
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
    journal_entity = relationship(
        "Journal",
        back_populates="articles",
    )
    source_database = relationship(
        "SourceDatabase",
        back_populates="articles",
    )
    article_countries = relationship(
        "ArticleCountry",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    countries = relationship(
        "Country",
        secondary="article_countries",
        back_populates="articles",
        viewonly=True,
    )
    article_citations = relationship(
        "ArticleCitation",
        back_populates="article",
        cascade="all, delete-orphan",
    )
    cited_references = relationship(
        "CitedReference",
        secondary="article_citations",
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


class ArticleCountry(Base):
    """Junction model mapping articles to countries."""

    __tablename__ = "article_countries"
    __table_args__ = (
        UniqueConstraint(
            "article_id",
            "country_id",
            name="uq_article_country",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key junction identifier",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to articles.id",
    )
    country_id = Column(
        Integer,
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to countries.id",
    )

    article = relationship("Article", back_populates="article_countries")
    country = relationship("Country", back_populates="article_countries")


class ArticleCitation(Base):
    """Junction model connecting an article to cited references."""

    __tablename__ = "article_citations"
    __table_args__ = (
        UniqueConstraint(
            "article_id",
            "cited_reference_id",
            name="uq_article_citation",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key junction identifier",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to citing article",
    )
    cited_reference_id = Column(
        Integer,
        ForeignKey("cited_references.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to cited reference",
    )

    article = relationship("Article", back_populates="article_citations")
    cited_reference = relationship("CitedReference", back_populates="article_citations")


class Country(Base):
    """Represents a geographical country involved in the publication."""

    __tablename__ = "countries"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key integer identifier",
    )
    name = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Standardized name of the country",
    )

    article_countries = relationship(
        "ArticleCountry",
        back_populates="country",
        cascade="all, delete-orphan",
    )
    articles = relationship(
        "Article",
        secondary="article_countries",
        back_populates="countries",
        viewonly=True,
    )


class CitedReference(Base):
    """Represents a unique cited reference extracted from an article."""

    __tablename__ = "cited_references"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key integer identifier",
    )
    raw_string = Column(
        Text,
        nullable=False,
        unique=True,
        index=True,
        comment="Raw unique string representing this reference",
    )
    author = Column(
        String(255),
        nullable=True,
        comment="Extracted first author of the reference",
    )
    year = Column(
        Integer,
        nullable=True,
        comment="Extracted publication year of the reference",
    )
    source = Column(
        String(255),
        nullable=True,
        comment="Extracted journal or source of the reference",
    )
    doi = Column(
        String(255),
        nullable=True,
        index=True,
        comment="DOI of the cited reference if available",
    )

    article_citations = relationship(
        "ArticleCitation",
        back_populates="cited_reference",
        cascade="all, delete-orphan",
    )
    articles = relationship(
        "Article",
        secondary="article_citations",
        back_populates="cited_references",
        viewonly=True,
    )


class Journal(Base):
    """Represents an academic journal or publication venue."""

    __tablename__ = "journals"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key integer identifier",
    )
    name = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
        comment="Full name of the journal",
    )
    iso_abbreviation = Column(
        String(255),
        nullable=True,
        comment="ISO abbreviation of the journal",
    )
    issn = Column(
        String(50),
        nullable=True,
        comment="International Standard Serial Number",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp of creation",
    )

    articles = relationship(
        "Article",
        back_populates="journal_entity",
    )