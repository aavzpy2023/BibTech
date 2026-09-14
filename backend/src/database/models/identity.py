"""Identity domain models for affiliations, authors, and article authorship."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from src.database.session import Base


class Affiliation(Base):
    """Represents an academic institution or research organization."""

    __tablename__ = "affiliations"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for affiliation",
    )
    institution = Column(
        String(255),
        nullable=False,
        comment="Institution or organization name",
    )
    department = Column(
        String(255),
        nullable=True,
        comment="Academic department or laboratory division",
    )
    country = Column(
        String(100),
        nullable=True,
        comment="Country location of the institution",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when affiliation was created",
    )

    authors = relationship("Author", back_populates="affiliation")


class Author(Base):
    """Represents a researcher or publication contributor."""

    __tablename__ = "authors"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for author",
    )
    name = Column(
        String(255),
        nullable=False,
        comment="Full name of the author or researcher",
    )
    orcid = Column(
        String(50),
        nullable=True,
        index=True,
        comment="Author's ORCID identifier",
    )
    email = Column(
        String(255),
        nullable=True,
        comment="Contact email address for the author",
    )
    affiliation_id = Column(
        Integer,
        ForeignKey("affiliations.id", ondelete="SET NULL"),
        nullable=True,
        comment="Foreign key linking to affiliations.id",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when author record was created",
    )

    affiliation = relationship("Affiliation", back_populates="authors")
    author_articles = relationship(
        "AuthorArticle",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    articles = relationship(
        "Article",
        secondary="author_articles",
        back_populates="authors",
        viewonly=True,
    )


class AuthorArticle(Base):
    """Junction model connecting authors to articles with authorship metadata."""

    __tablename__ = "author_articles"
    __table_args__ = (
        UniqueConstraint(
            "author_id",
            "article_id",
            name="uq_author_article",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key junction identifier",
    )
    author_id = Column(
        Integer,
        ForeignKey("authors.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to authors.id",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to articles.id",
    )
    author_order = Column(
        Integer,
        default=1,
        nullable=False,
        comment="Order of authorship in the publication (1-based)",
    )
    is_corresponding = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Flag indicating if this author is the corresponding author",
    )

    author = relationship("Author", back_populates="author_articles")
    article = relationship("Article", back_populates="author_articles")


class Keyword(Base):
    """Represents a descriptive keyword, MeSH term, or topical tag."""

    __tablename__ = "keywords"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for keyword",
    )
    name = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Normalized keyword or term string",
    )
    type = Column(
        String(50),
        default="author",
        nullable=False,
        comment="Classification type of keyword (e.g. author, mesh, index)",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when keyword was registered",
    )

    keyword_articles = relationship(
        "KeywordArticle",
        back_populates="keyword",
        cascade="all, delete-orphan",
    )
    articles = relationship(
        "Article",
        secondary="keyword_articles",
        back_populates="keywords",
        viewonly=True,
    )


class KeywordArticle(Base):
    """Junction model connecting keywords to articles."""

    __tablename__ = "keyword_articles"
    __table_args__ = (
        UniqueConstraint(
            "keyword_id",
            "article_id",
            name="uq_keyword_article",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key junction identifier",
    )
    keyword_id = Column(
        Integer,
        ForeignKey("keywords.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to keywords.id",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to articles.id",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when keyword was linked to article",
    )

    keyword = relationship("Keyword", back_populates="keyword_articles")
    article = relationship("Article", back_populates="keyword_articles")