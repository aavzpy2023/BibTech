---
type: "roadmap"
epic_name: "Database Schema Definition"
domain: "Backend / Database"
complexity_aggregate: "HARD"
---

# Roadmap 5: Database Schema Definition

## EPIC 6: RELATIONAL DATABASE SCHEMA DEFINITION | [ISOLATED VERTICAL]

- [x] Story 6.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-6.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 6, its [REQ-015] to [REQ-017] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_5_database_schema.md]. Type: Task.

- [x] Story 6.1: DB Infrastructure & Alembic Bootstrap | [MoSCoW: MUST] | [Complexity: EASY]
  > Files touched: pyproject.toml, session.py, alembic/env.py
  Business Requirement: Isolate shared core database configuration, install dependencies, and initialize the migration environment to prevent data wipeout. (<-- REQ-015)
  Story Context Radius: {"backend/pyproject.toml": [""], "backend/src/database/session.py": [""], "backend/alembic.ini": [""], "leai_docs/planning/roadmap_5_database_schema.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-6.1.1] [CORE/DEPENDENCIES]: [1. Open backend/pyproject.toml. 2. Add sqlalchemy>=2.0.0, alembic>=1.13.0, and passlib[bcrypt]>=1.7.4. 3. Execute dependency installation command to sync environment]. Type: Task.
  - [ID-6.1.2] [CORE/WIRING]: [1. Create backend/src/database/session.py. 2. Define Base = declarative_base(). 3. Define a generic get_db() generator yielding a SQLAlchemy session. Keep under 25 lines]. Type: Task.
  - [ID-6.1.3] [CORE/MIGRATIONS]: [1. Initialize Alembic within backend/. 2. Modify backend/alembic/env.py to import Base from backend.src.database.session. 3. Set target_metadata = Base.metadata to link the ORM to the migration engine safely]. Type: Task.
  - [ID-6.1.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_5_database_schema.md and check - [x] for Story 6.1. 2. Append > Files touched: pyproject.toml, session.py, alembic/env.py under the story]. Type: Task.

- [x] Story 6.2: Core Domain Models (Projects & Articles) | [MoSCoW: MUST] | [Complexity: HARD]
  > Files touched: core.py, test_core_models.py, alembic/versions/001_add_core_models.py
  Business Requirement: Define the central entities Project and Article with a Many-to-Many relationship, enforcing Semantic Primacy. (<-- REQ-015)
  Story Context Radius: {"backend/src/database/session.py": [""], "backend/src/database/models/core.py": [""], "backend/tests/database/test_core_models.py": [""], "backend/alembic/env.py": [""], "leai_docs/planning/roadmap_5_database_schema.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.2.1] [TESTING/TDE]: [1. Arrange: Setup SQLite in-memory engine and Base.metadata.create_all. 2. Act: Insert a Project (hashed password) and an Article (with a dummy DOI), linked via ProjectArticle. 3. Assert: Verify the bi-directional relationship resolves correctly in memory without I/O]. Type: Task.
  - [ID-6.2.2] [CORE/LOGIC]: [1. Create backend/src/database/models/core.py. 2. Define Project, Article, and ProjectArticle (M2M) inheriting from Base. 3. ABSOLUTE DIRECTIVE: Every single SQLAlchemy Column MUST include a comment="..." describing its purpose in English (e.g., comment="Normalized DOI unique key"). 4. Ensure Article contains all requested fields (doi, title, journal, etc.)]. Type: Task.
  - [ID-6.2.3] [CORE/MIGRATIONS]: [1. Open backend/alembic/env.py and ensure core.py is imported so metadata is registered. 2. Execute alembic revision --autogenerate -m "Add core models". 3. Review the generated migration file to ensure it ONLY contains op.create_table commands]. Type: Task.
  - [ID-6.2.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_5_database_schema.md and check - [x] for Story 6.2. 2. Append > Files touched: core.py, test_core_models.py, alembic versions under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-015]]. Type: Task.

- [x] Story 6.3: Identity Domain Models (Authors & Affiliations) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  > Files touched: identity.py, test_identity_models.py, alembic/versions/002_add_identity_models.py
  Business Requirement: Define Author and Affiliation entities, linking Authors to Articles, utilizing explicit semantic payloads. (<-- REQ-016)
  Story Context Radius: {"backend/src/database/models/core.py": ["class Article"], "backend/src/database/models/identity.py": [""], "backend/tests/database/test_identity_models.py": [""], "backend/alembic/env.py": [""], "leai_docs/planning/roadmap_5_database_schema.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.3.1] [TESTING/TDE]: [1. Arrange: Setup in-memory SQLite. 2. Act: Insert an Affiliation, an Author referencing it, and link Author to an Article via AuthorArticle. 3. Assert: Query the Article and explicitly assert article.authors[0].affiliation.institution matches the injected state]. Type: Task.
  - [ID-6.3.2] [CORE/LOGIC]: [1. Create backend/src/database/models/identity.py. 2. Define Affiliation, Author, and AuthorArticle (M2M to Article). 3. Include comment="..." on every column (e.g., comment="Author's ORCID identifier"). 4. Use string references (e.g., "Article") in relationships to prevent circular imports]. Type: Task.
  - [ID-6.3.3] [CORE/MIGRATIONS]: [1. Import identity.py into alembic/env.py. 2. Run alembic revision --autogenerate -m "Add identity models". 3. Validate safety of the generated script]. Type: Task.
  - [ID-6.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_5_database_schema.md and check - [x] for Story 6.3. 2. Append > Files touched: identity.py, test_identity_models.py under the story]. Type: Task.

- [ ] Story 6.4: Auxiliary Keyword Models | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Define Keywords and link them to Articles cleanly to maintain atomic micro-surgery limits. (<-- REQ-016)
  Story Context Radius: {"backend/src/database/models/core.py": ["class Article"], "backend/src/database/models/identity.py": [""], "backend/tests/database/test_identity_models.py": [""], "leai_docs/planning/roadmap_5_database_schema.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.4.1] [TESTING/TDE]: [1. Arrange: Setup in-memory SQLite. 2. Act: Insert a Keyword (type="author") and link it to an Article. 3. Assert: Query Article and assert article.keywords length is > 0]. Type: Task.
  - [ID-6.4.2] [CORE/LOGIC]: [1. Open backend/src/database/models/identity.py. 2. Append Keyword and KeywordArticle (M2M) models. 3. Inject comment="..." payloads. 4. Establish bi-directional relationships with Article]. Type: Task.
  - [ID-6.4.3] [CORE/MIGRATIONS]: [1. Run alembic revision --autogenerate -m "Add keywords". 2. Validate script safety]. Type: Task.
  - [ID-6.4.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_5_database_schema.md and check - [x] for Story 6.4. 2. Append > Files touched: identity.py, test_identity_models.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-016]]. Type: Task.

- [ ] Story 6.5: Extended Tracking Models (References, Funding, Downloads) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Define distinct tables for tracking citations, financial support, and system downloads securely. (<-- REQ-017)
  Story Context Radius: {"backend/src/database/models/core.py": ["class Article", "class Project"], "backend/src/database/models/tracking.py": [""], "backend/tests/database/test_tracking_models.py": [""], "backend/alembic/env.py": [""], "leai_docs/planning/roadmap_5_database_schema.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-6.5.1] [TESTING/TDE]: [1. Arrange: Setup in-memory SQLite. 2. Act: Insert an Article and a Project. Insert Reference, Funding, and Download records referencing the correct FKs. 3. Assert: Query Article and verify references, funding, and downloads relationships resolve correctly]. Type: Task.
  - [ID-6.5.2] [CORE/LOGIC]: [1. Create backend/src/database/models/tracking.py. 2. Define Reference, Funding, and Download models pointing to article_id (and project_id for Downloads) via FK constraints. 3. Enforce Semantic Primacy with comment="..." on all columns]. Type: Task.
  - [ID-6.5.3] [CORE/MIGRATIONS]: [1. Import tracking.py into alembic/env.py. 2. Run alembic revision --autogenerate -m "Add tracking models". 3. Validate generated script]. Type: Task.
  - [ID-6.5.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_5_database_schema.md and check - [x] for Story 6.5. 2. Append > Files touched: tracking.py, test_tracking_models.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-017]]. Type: Task.