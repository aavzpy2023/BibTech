---
type: "roadmap"
epic_name: "EPIC 15: BIBLIOGRAPHIC METADATA EXPANSION & BULK INJECTION"
domain: "Bibliography Ingestion"
complexity_aggregate: "HARD"
---

# EPIC 15: BIBLIOGRAPHIC METADATA EXPANSION & BULK INJECTION | BIBLIOGRAPHY

- [x] Story 15.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-15.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 15, its [REQ-042] to [REQ-045] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md]. Type: Task.

- [x] Story 15.1: UI Dumb View Wiring (Text Standardization) | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Update the ingestion modal to display "Processing..." instead of "Injecting..." to accurately reflect the new bulk processing nature. (<-- REQ-042)
  Story Context Radius: {"frontend/src/components/references/UploadReferencesModal.jsx": ["*"]}
  Layered Technical Breakdown:
  - [ID-15.1.1] [TESTING/TDE]: [1. Arrange: Mount UploadReferencesModal with isLoading=true. 2. Act: Render the component. 3. Assert: Verify the text "Processing..." is displayed and "Injecting references..." is strictly absent]. Type: Task.
  - [ID-15.1.2] [UI/VIEW]: [1. Open UploadReferencesModal.jsx. 2. Locate the isLoading conditional block. 3. Change the text from "Injecting references into database..." to "Processing..."]. Type: Task.
  - [ID-15.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md and check - [x] for Story 15.1. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-042]]. Type: Task.
  > Files touched: frontend/src/components/references/UploadReferencesModal.jsx, frontend/src/components/references/UploadReferencesModal.test.jsx, leai_docs/planning/global_backlog.md, leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md

- [x] Story 15.2: Database Schema Expansion & State Preservation | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Expand the Article database model to store comprehensive .bib metadata while strictly preserving existing data via Alembic. (<-- REQ-043)
  Story Context Radius: {"backend/src/database/models/core.py": [""], "backend/alembic/env.py": [""]}
  Layered Technical Breakdown:
  - [ID-15.2.1] [TESTING/TDE]: [1. Arrange: Create an in-memory SQLite session. 2. Act: Instantiate and add an Article with new fields (abstract, publisher, doi, times_cited). 3. Assert: Verify the fields are persisted and retrieved correctly]. Type: Task.
  - [ID-15.2.2] [CORE/MODELS]: [1. Open backend/src/database/models/core.py. 2. Add new Column(String/Text) definitions to Article for: abstract, publisher, language, keywords, research_areas, web_of_science_categories, funding_text, journal_iso, oa_status, doi, issn. Add Column(Integer) for times_cited, cited_references_count. 3. CRITICAL: Every new column MUST include a comment='...' payload in English explaining its purpose]. Type: Task.
  - [ID-15.2.3] [CORE/MIGRATION]: [1. Run alembic revision --autogenerate -m "add_article_extended_metadata". 2. Open the generated migration file in backend/alembic/versions/. 3. CRITICAL: Audit the file to ensure ONLY op.add_column exists. Delete any accidental op.drop_column directives to prevent data wipeout. 4. Run alembic upgrade head]. Type: Task.
  - [ID-15.2.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md and check - [x] for Story 15.2. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-043]]. Type: Task.
  > Files touched: backend/tests/database/test_core_models.py, backend/src/database/models/core.py, leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md, leai_docs/planning/global_backlog.md

- [x] Story 15.3: Boundary Marshal Schema Expansion | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Expand the Pydantic schema to act as a Boundary Marshal for the new metadata fields. (<-- REQ-044)
  Story Context Radius: {"backend/src/bibliography/schemas.py": ["*"]}
  Layered Technical Breakdown:
  - [ID-15.3.1] [TESTING/TDE]: [1. Arrange: Create a dictionary with the new extended fields. 2. Act: Instantiate ParsedReference(**data). 3. Assert: Verify the schema validates and correctly types the optional fields]. Type: Task.
  - [ID-15.3.2] [CORE/SCHEMAS]: [1. Open backend/src/bibliography/schemas.py. 2. Add corresponding Optional[str] and Optional[int] fields to the ParsedReference model matching the new DB columns exactly. 3. Save the file]. Type: Task.
  - [ID-15.3.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md and check - [x] for Story 15.3. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-044]]. Type: Task.
  > Files touched: backend/src/bibliography/schemas.py, backend/tests/bibliography/test_schemas.py, leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md, leai_docs/planning/global_backlog.md

- [x] Story 15.4: Parser Core Logic (Micro-Surgery) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Update the parser service to extract the new metadata fields from .bib files and map them to the Boundary Marshal. (<-- REQ-044)
  Story Context Radius: {"backend/src/bibliography/parser_service.py": ["*"], "backend/src/bibliography/schemas.py": ["ParsedReference"]}
  Layered Technical Breakdown:
  - [ID-15.4.1] [TESTING/TDE]: [1. Arrange: Mock a .bib string containing fields like Abstract, Publisher, Keywords, DOI, and Times-Cited. 2. Act: Call parse_bibliography_content. 3. Assert: Verify the returned ParsedReference objects contain the correctly mapped extended fields]. Type: Task.
  - [ID-15.4.2] [CORE/LOGIC]: [1. Open backend/src/bibliography/parser_service.py. 2. Update _parse_bibtex_entries to extract keys like abstract, publisher, keywords, doi, issn, times-cited using _extract_bib_field. 3. Map these extracted values to the new ParsedReference fields during instantiation]. Type: Task.
  - [ID-15.4.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md and check - [x] for Story 15.4. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-044]]. Type: Task.
  > Files touched: backend/src/bibliography/parser_service.py, backend/tests/bibliography/test_parser.py, leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md, leai_docs/planning/global_backlog.md

- [ ] Story 15.5: Bulk Injection Refactoring (Performance & Concurrency) | [MoSCoW: MUST] | [Complexity: HARD]
  Business Requirement: Refactor the injection service to use bulk inserts instead of 1-by-1 insertion to drastically improve performance and prevent DB locking. (<-- REQ-045)
  Story Context Radius: {"backend/src/bibliography/injection_service.py": ["*"], "backend/src/database/models/core.py": ["Article", "ProjectArticle"]}
  Layered Technical Breakdown:
  - [ID-15.5.1] [TESTING/TDE]: [1. Arrange: Mock a DB session and generate a list of 100 ParsedReference objects. 2. Act: Call inject_references_to_db. 3. Assert: Verify that a bulk insert method (e.g., session.execute(insert)) was called, and that the session was not flushed 100 separate times]. Type: Task.
  - [ID-15.5.2] [CORE/LOGIC]: [1. Open backend/src/bibliography/injection_service.py. 2. Refactor _inject_references_inner to accumulate new Article dictionaries. 3. Replace the iterative db.add() loop with SQLAlchemy 2.0 bulk insert(Article).values(articles_data).on_conflict_do_nothing() (or equivalent SQLite compatible bulk upsert). 4. Do the same for Author and ProjectArticle relationships. 5. Commit the transaction once at the end]. Type: Task.
  - [ID-15.5.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_15_bibliographic_metadata_and_bulk_injection.md and check - [x] for Story 15.5. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-045]]. Type: Task.