"""Extended tracking models for citations, funding, and paper downloads."""
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..session import Base


class Reference(Base):
    """Represents a citation or reference cited by an article."""

    __tablename__ = "references"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for reference",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to the referencing article",
    )
    raw_citation = Column(
        Text,
        nullable=False,
        comment="Full text or formatted citation string of the reference",
    )
    doi = Column(
        String(255),
        nullable=True,
        index=True,
        comment="Extracted or resolved DOI for cited reference",
    )
    title = Column(
        Text,
        nullable=True,
        comment="Title of the cited reference",
    )
    year = Column(
        Integer,
        nullable=True,
        comment="Publication year of the cited reference",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when reference was extracted",
    )

    article = relationship("Article", back_populates="references")


class Funding(Base):
    """Represents financial support or grants supporting an article."""

    __tablename__ = "funding"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for funding record",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to funded article",
    )
    agency = Column(
        String(255),
        nullable=False,
        comment="Name of funding agency or institution",
    )
    grant_number = Column(
        String(100),
        nullable=True,
        comment="Specific grant or award identification number",
    )
    country = Column(
        String(100),
        nullable=True,
        comment="Country of funding organization",
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when funding record was created",
    )

    article = relationship("Article", back_populates="funding")


class Download(Base):
    """Represents a document acquisition event for an article in a project."""

    __tablename__ = "downloads"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Primary key identifier for download record",
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to downloaded article",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="Foreign key linking to parent project",
    )
    source = Column(
        String(100),
        nullable=False,
        comment="Download source or resolver (e.g. unpaywall, openalex)",
    )
    file_path = Column(
        String(500),
        nullable=True,
        comment="Local or cloud storage path of downloaded PDF",
    )
    file_size_bytes = Column(
        Integer,
        nullable=True,
        comment="Size of downloaded file in bytes",
    )
    status = Column(
        String(50),
        default="completed",
        nullable=False,
        comment="Download status (e.g. completed, failed, in_progress)",
    )
    downloaded_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when download occurred",
    )

    article = relationship("Article", back_populates="downloads")
    project = relationship("Project", back_populates="downloads")