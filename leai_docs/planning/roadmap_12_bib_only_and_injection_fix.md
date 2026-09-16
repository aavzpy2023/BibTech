---
type: "roadmap"
epic_name: "EPIC 13: BIB ONLY INGESTION & INJECTION RESILIENCE"
domain: "Bibliography Ingestion"
complexity_aggregate: "MEDIUM"
---

# EPIC 13: BIB ONLY INGESTION & INJECTION RESILIENCE | BIBLIOGRAPHY VERTICAL

- [x] Story 12.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: `{"leai_docs/planning/global_backlog.md": ["*"]}`
  Layered Technical Breakdown:
  - [ID-12.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 13, its [REQ-036] to [REQ-039] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md]. Type: Task.

- [x] Story 12.1: Backend Router Boundary Marshal (.bib Restriction) | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-036)
  Story Context Radius: `{"backend/src/bibliography/router.py": [""], "leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}`
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  - [ID-12.1.1] [TESTING/TDE]: [1. Arrange: Mock UploadFile with a .ris extension. 2. Act: Invoke _process_upload with the mock file. 3. Assert: Verify that an HTTPException with status 400 is raised]. Type: Task.
  - [ID-12.1.2] [LOGIC/IO]: [1. Open backend/src/bibliography/router.py. 2. In _process_upload and _process_inject, modify the extension validation to strictly allow ONLY [".bib"]. 3. In _process_inject, add a try...except block around the inject_references_to_db call to catch RuntimeError and raise an HTTPException with status 503 and detail "Error de conexión a la base de datos. Intente nuevamente."]. Type: Task.
  - [ID-12.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md and check - [x] for Story 12.1. 2. Append > Files touched: backend/src/bibliography/router.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for REQ-036]. Type: Task.
  > Files touched: backend/src/bibliography/router.py

- [x] Story 12.2: Backend Parser Core Logic (.bib Extraction) | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- REQ-038)
  Story Context Radius: `{"backend/src/bibliography/parser_service.py": [""], "leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}`
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  - [ID-12.2.1] [TESTING/TDE]: [1. Arrange: Mock a .bib string with no valid entries. 2. Act: Invoke parse_bibliography_content with the mock string and ext=".bib". 3. Assert: Verify that a ValueError is raised]. Type: Task.
  - [ID-12.2.2] [LOGIC/CORE]: [1. Open backend/src/bibliography/parser_service.py. 2. Delete all .ris parsing functions (_extract_ris_*, _parse_ris_fallback) and the .ris branch in parse_bibliography_content. 3. In parse_bibliography_content, if entries is empty after _parse_bibtex_entries, raise ValueError("No se encontraron items válidos en el archivo .bib")]. Type: Task.
  - [ID-12.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md and check - [x] for Story 12.2. 2. Append > Files touched: backend/src/bibliography/parser_service.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for REQ-038]. Type: Task.
  > Files touched: backend/src/bibliography/parser_service.py

- [x] Story 12.3: Backend Injection DB Resilience
  Story Context Radius: `{"backend/src/bibliography/injection_service.py": [""], "leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}`
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  - [ID-12.3.1] [TESTING/TDE]: [1. Arrange: Mock the SQLAlchemy Session so that db.query() raises sqlalchemy.exc.OperationalError. 2. Act: Invoke inject_references_to_db. 3. Assert: Verify that a RuntimeError is raised]. Type: Task.
  - [ID-12.3.2] [LOGIC/DB]: [1. Open backend/src/bibliography/injection_service.py. 2. Import OperationalError from sqlalchemy.exc. 3. Wrap the DB query and commit logic inside inject_references_to_db in a try...except OperationalError block. 4. If caught, raise RuntimeError("Database connection failed")]. Type: Task.
  - [ID-12.3.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md and check - [x] for Story 12.3. 2. Append > Files touched: backend/src/bibliography/injection_service.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for REQ-039]. Type: Task.
  > Files touched: backend/src/bibliography/injection_service.py

- [ ] Story 12.4: Frontend Hook State Fractality (.bib Validation)
  Story Context Radius: `{"frontend/src/hooks/useReferencesUpload.js": [""], "leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}`
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  - [ID-12.4.1] [TESTING/TDE]: [1. Arrange: Mock a file object with name "test.ris". 2. Act: Invoke uploadAndInject with the mock file. 3. Assert: Verify that setError is called with "Solo se permiten archivos .bib" and no fetch request is executed]. Type: Task.
  - [ID-12.4.2] [LOGIC/UI_STATE]: [1. Open frontend/src/hooks/useReferencesUpload.js. 2. In uploadAndInject, iterate over files and verify file.name.toLowerCase().endsWith('.bib'). If false, call setError('Solo se permiten archivos .bib'), setIsSuccess(false), and return. 3. Ensure backend error payloads (like the 503 DB error) are correctly passed to setError]. Type: Task.
  - [ID-12.4.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_12_bib_only_and_injection_fix.md and check - [x] for Story 12.4. 2. Append > Files touched: frontend/src/hooks/useReferencesUpload.js under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for REQ-037]. Type: Task.