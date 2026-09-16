# Roadmap 18: Bibliometric Data Warehouse & Advanced Scientometrics

## Context
To support advanced bibliometric network analysis (Co-citation, Bibliographic Coupling, Co-word analysis, and Institutional/Geographical networks) akin to VOSviewer or CiteSpace, the raw text fields must be decomposed into a relational Snowflake Schema. This roadmap covers the normalization of Countries, Journals, and Cited References (CR) into discrete dimensional tables optimized for adjacency matrix generation.

## Story 18.0: Roadmap & Planning Initialization
- [x] Initialize this roadmap.
- [x] Append EPIC 18 to `global_backlog.md`.

## [REQ-052] Database Schema Expansion (Countries, Journals, Cited References)
- **Goal**: Add new SQL models to support the bibliometric dimensions.
- **Tasks**:
  - [x] Add `Country` and `ArticleCountry` mapping to handle geographical collaboration networks.
  - [x] Add `CitedReference` and `ArticleCitation` mapping to handle co-citation and bibliographic coupling networks.
  - [x] Add `Journal` model and prepare transition for core `Article` journal string.
- **Validations**: Ensure SQLAlchemy models possess correct ForeignKeys, unique constraints, and indices for graph traversal performance.

## [REQ-053] Parser Engine Upgrades (Country & CR Extraction)
- **Goal**: Refactor `wos_parser.py` and `parser_service.py` to cleanly extract the new dimensions.
- **Tasks**:
  - [x] Implement a country extractor algorithm from the `Affiliations` raw string (e.g., regex isolating the last segment of the comma-separated address).
  - [x] Implement a cited references (CR) parser to split the semicolon-separated strings into individual unique reference identifiers (Author, Year, Source).
  - [x] Ensure `schemas.py` (`ParsedReference`) supports the newly extracted data arrays.

## [REQ-054] Injection Service Refactoring (Snowflake Dimension Mapping)
- **Goal**: Update `injection_service.py` to bulk-insert the new relational entities safely and performantly.
- **Tasks**:
  - [x] Bulk inject `countries` idempotently and link via `article_countries`.
  - [x] Bulk inject `cited_references` idempotently and link via `article_citations`.
  - [x] Refactor `journal` mapping logic to dynamically build the `journals` dimension.
- **Validations**: Assert zero unique constraint violations during bulk import and benchmark execution time.

## [REQ-055] Alembic Migration Generation & Schema Upgrade
- **Goal**: Apply the model changes to the physical PostgreSQL database safely.
- **Tasks**:
  - [x] Generate Alembic revision `add_bibliometric_snowflake_schema`.
  - [x] Execute DB upgrade.
- **Validations**: Verify physical tables exist and constraints are sound via test queries.