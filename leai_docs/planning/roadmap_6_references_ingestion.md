---
type: "roadmap"
epic_name: "References Database Ingestion"
domain: "Fullstack / Ingestion"
complexity_aggregate: "MEDIUM"
---

# Roadmap 6: References Database Ingestion

## EPIC 7: REFERENCES DATABASE INGESTION | [ISOLATED VERTICAL]

- [x] Story 6.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers
  ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-6.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if
    missing. 2. Append EPIC 7, its [REQ-018] to [REQ-021] list, and the
    Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE
    raw markdown response (INCLUDING the YAML Frontmatter block above) into
    leai_docs/planning/roadmap_6_references_ingestion.md]. Type: Task.
  > Files touched: leai_docs/planning/roadmap_6_references_ingestion.md, leai_docs/planning/global_backlog.md

- [x] Story 6.1: Backend DB Ingestion Repository/Service | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Create an isolated, atomic service to persist parsed
  entities and link them to a Project without mutating schema. (<-- REQ-018)
  Story Context Radius: {"backend/src/database/models/core.py": ["class
  Article", "class Project", "class ProjectArticle"],
  "backend/src/bibliography/schemas.py": ["class ParsedReference"],
  "backend/src/bibliography/injection_service.py": [""],
  "backend/tests/bibliography/test_injection.py": [""],
  "leai_docs/planning/roadmap_6_references_ingestion.md": [""],
  "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.1.1] [TESTING/TDE]: [1. Arrange: Instantiate an in-memory SQLite
    SQLAlchemy Session. Create tables from Base.metadata. Create a mock list
    of ParsedReference. 2. Act: Call inject_references_to_db(session,
    mock_refs, "TEST-PROJ"). 3. Assert: Query Project by name to ensure it
    exists. Query Article to ensure insertion. Query ProjectArticle to verify
    the Many-to-Many link]. Type: Task.
  - [ID-6.1.2] [CORE/LOGIC]: [1. Create
    backend/src/bibliography/injection_service.py. 2. Implement
    inject_references_to_db(db: Session, refs: list[ParsedReference],
    project_code: str) -> int. 3. Query Project filtering by name ==
    project_code. If not found, instantiate and db.add() it. 4. Iterate refs,
    instantiate Article using the parsed data, and link it to the project via
    ProjectArticle. 5. Execute db.commit() and return the count of inserted
    articles. (Strict <25 lines)]. Type: Task.
  - [ID-6.1.3] [PLANNING/SYNC]: [1. Open
    leai_docs/planning/roadmap_6_references_ingestion.md and check - [x] for
    Story 6.1. 2. Append > Files touched: injection_service.py,
    test_injection.py under the story]. Type: Task.
  > Files touched: injection_service.py, test_injection.py

- [x] Story 6.2: Backend Injection Endpoint & Boundary Marshal | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Wire the API endpoint using explicit Dependency
  Injection (DI) and enforce primitive payload boundaries. (<-- REQ-018)
  Story Context Radius: {"backend/src/bibliography/router.py": ["router",
  "def upload_bibliography"], "backend/src/database/session.py": ["def
  get_db"], "backend/src/bibliography/parser_service.py": ["def
  parse_bibliography_content"],
  "backend/src/bibliography/injection_service.py": ["def
  inject_references_to_db"], "backend/tests/bibliography/test_router.py":
  [""], "leai_docs/planning/roadmap_6_references_ingestion.md": [""],
  "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-6.2.1] [TESTING/TDE]: [1. Arrange: Mock parse_bibliography_content and
    inject_references_to_db to return 10. 2. Act: Send POST to
    /api/bibliography/inject using TestClient with a mock file and
    data={"project_code": "PROJ-1"}. 3. Assert: Verify status code is 200 and
    response JSON is {"message": "Success", "inserted": 10}]. Type: Task.
  - [ID-6.2.2] [EXTERNAL/IO]: [1. Open backend/src/bibliography/router.py. 2.
    Import Depends and Form from fastapi, and get_db from session. 3.
    Implement @router.post("/inject") taking strictly file: UploadFile =
    File(...), project_code: str = Form(...), and db: Session = Depends(get_db).
    4. Validate extension. Await file read. Call parse_bibliography_content.
    Call inject_references_to_db. Return success dictionary]. Type: Task.
  - [ID-6.2.3] [PLANNING/SYNC]: [1. Open
    leai_docs/planning/roadmap_6_references_ingestion.md and check - [x] for
    Story 6.2. 2. Append > Files touched: router.py, test_router.py under the
    story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for
    [REQ-018]]. Type: Task.
  > Files touched: router.py, test_router.py

- [ ] Story 6.3: Frontend Injection State Hook (State Fractality) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Isolate the multi-part upload and state tracking logic
  entirely outside the React UI component. (<-- REQ-020)
  Story Context Radius: {"frontend/src/hooks/useReferencesUpload.js": [""],
  "frontend/src/hooks/useReferencesUpload.test.js": [""],
  "leai_docs/planning/roadmap_6_references_ingestion.md": [""],
  "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.3.1] [TESTING/TDE]: [1. Arrange: Mock global.fetch to return {
    message: "Success", inserted: 5 }. 2. Act: Render hook useReferencesUpload.
    Call setProjectCode("TEST"), then uploadAndInject(mockFile). 3. Assert:
    Verify fetch was called with FormData containing both file and
    project_code, and isSuccess equals true]. Type: Task.
  - [ID-6.3.2] [UI/STATE]: [1. Create
    frontend/src/hooks/useReferencesUpload.js. 2. Define state: projectCode
    (string), isLoading (boolean), isSuccess (boolean), error (string). 3.
    Implement async uploadAndInject(file): If no project code or file, abort.
    Instantiate FormData. Append 'file' and 'project_code'. Execute
    fetch('/api/bibliography/inject'). 4. Mutate state based on response.
    Export state and mutators]. Type: Task.
  - [ID-6.3.3] [PLANNING/SYNC]: [1. Open
    leai_docs/planning/roadmap_6_references_ingestion.md and check - [x] for
    Story 6.3. 2. Append > Files touched: useReferencesUpload.js,
    useReferencesUpload.test.js under the story. 3. Open
    leai_docs/planning/global_backlog.md and check - [x] for [REQ-020]]. Type:
    Task.

- [ ] Story 6.4: Frontend Dumb Views & Routing Assembly | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement strict Dumb Components for the table and
  hover modal, then assemble the view via Dependency Injection from the hook.
  (<-- REQ-019, REQ-021)
  Story Context Radius:
  {"frontend/src/components/BibliographyUploader.jsx":
  ["BibliographyUploader"],
  "frontend/src/components/references/ReferencesDataTable.jsx": [""],
  "frontend/src/views/ReferencesView.jsx": [""], "frontend/src/App.jsx":
  ["App"], "frontend/src/hooks/useReferencesUpload.js":
  ["useReferencesUpload"],
  "leai_docs/planning/roadmap_6_references_ingestion.md": [""],
  "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-6.4.1] [UI/VIEW]: [1. Create
    frontend/src/components/references/ReferencesDataTable.jsx. 2. Implement a
    dumb functional component taking a data array prop. Render a standard
    <table> with columns: Title, Author, Year, Journal. 3. Implement a
    CSS-based title attribute or a pure React state <div> popover bound to
    onMouseEnter/onMouseLeave on the row to display raw JSON metadata]. Type:
    Task.
  - [ID-6.4.2] [UI/WIRING]: [1. Create frontend/src/views/ReferencesView.jsx.
    2. Invoke useReferencesUpload(). 3. Render a text input bound to
    projectCode and setProjectCode. 4. Render the existing imported
    BibliographyUploader, passing uploadAndInject to its onUpload prop.
    (Disable uploader if projectCode is empty). 5. Conditionally render
    success metrics and ReferencesDataTable if isSuccess is true]. Type: Task.
  - [ID-6.4.3] [UI/WIRING]: [1. Open frontend/src/App.jsx. 2. Import
    ReferencesView. 3. Add <Route path="references" element={<ReferencesView
    />} /> inside the main layout routing block]. Type: Task.
  - [ID-6.4.4] [PLANNING/SYNC]: [1. Open
    leai_docs/planning/roadmap_6_references_ingestion.md and check - [x] for
    Story 6.4. 2. Append > Files touched: ReferencesDataTable.jsx,
    ReferencesView.jsx, App.jsx under the story. 3. Open
    leai_docs/planning/global_backlog.md and check - [x] for [REQ-019],
    [REQ-021]]. Type: Task.