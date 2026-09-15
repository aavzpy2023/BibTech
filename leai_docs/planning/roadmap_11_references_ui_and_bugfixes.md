---
type: "roadmap"
epic_name: "References UI Refinement & Backend Bugfix"
domain: "Frontend UI & Backend Core"
complexity_aggregate: "MEDIUM"
---

# EPIC 12: REFERENCES UI REFINEMENT & BACKEND BUGFIX | [ISOLATED VERTICAL]

- [x] Story 11.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-11.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 12, its [REQ-032] to [REQ-035] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md]. Type: Task.

- [x] Story 11.1: Backend Typing Bugfix (Micro-Surgery) | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Resolve the NameError crashing the backend by properly importing typing generics. (&lt;-- REQ-032)
  &gt; Files touched: download_service.py, schemas.py, resolver_service.py
  Story Context Radius: {"backend/src/bibliography/download_service.py": [""], "backend/src/bibliography/schemas.py": [""], "backend/src/bibliography/resolver_service.py": [""], "leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-11.1.1] [TESTING/TDE]: [1. Arrange: Boot the FastAPI application context. 2. Act: Import execute_batch_download from download_service.py. 3. Assert: Verify the module loads successfully without throwing a NameError]. Type: Task.
  [ID-11.1.2] [CORE/LOGIC]: [1. Open backend/src/bibliography/download_service.py. 2. Ensure from typing import Optional, List, Dict, Any, AsyncGenerator is present at the top of the file. 3. Repeat this check and insertion for backend/src/bibliography/schemas.py and backend/src/bibliography/resolver_service.py]. Type: Task.
  [ID-11.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md and check - [ ] for Story 11.1. 2. Append &gt; Files touched: download_service.py, schemas.py, resolver_service.py under the story. 3. Open global_backlog.md and check - [ ] for [REQ-032]]. Type: Task.

- [x] Story 11.2: UploadReferencesModal Dark Mode Compliance | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Fix the invisible text issue by migrating the modal's hardcoded white theme to the global dark mode palette. (&lt;-- REQ-033)
  &gt; Files touched: UploadReferencesModal.jsx, UploadReferencesModal.test.jsx
  Story Context Radius: {"frontend/src/components/references/UploadReferencesModal.jsx": [""], "leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-11.2.1] [TESTING/TDE]: [1. Arrange: Render UploadReferencesModal with isOpen={true}. 2. Act: Query the modal container div. 3. Assert: Verify the backgroundColor style matches #161b22 and text elements do not use dark hex codes]. Type: Task.
  [ID-11.2.2] [UI/VIEW]: [1. Open frontend/src/components/references/UploadReferencesModal.jsx. 2. Update styles.modal to { ...backgroundColor: '#161b22', border: '1px solid #30363d' }. 3. Update styles.title and styles.label color to #f0f6fc. 4. Update styles.description and styles.hint color to #8b949e. 5. Update styles.input background to #0d1117 and color to #f0f6fc. 6. Update styles.cancelBtn background to #21262d, border to #30363d, and color to #f0f6fc]. Type: Task.
  [ID-11.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md and check - [ ] for Story 11.2. 2. Append &gt; Files touched: UploadReferencesModal.jsx under the story. 3. Open global_backlog.md and check - [ ] for [REQ-033]]. Type: Task.

- [x] Story 11.3: References Table Pagination &amp; Search State (State Fractality) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Isolate the pagination (13 rows per view) and search filtering logic into a pure custom hook. (&lt;-- REQ-034)
  &gt; Files touched: useReferencesTable.js, useReferencesTable.test.js
  Story Context Radius: {"frontend/src/hooks/useReferencesTable.js": [""], "frontend/src/hooks/useReferencesTable.test.js": [""], "leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-11.3.1] [TESTING/TDE]: [1. Arrange: Mock an array of 20 reference objects. 2. Act: Render useReferencesTable(mockData, 13). Call setSearchQuery('test'). 3. Assert: Verify paginatedData returns strictly the filtered slice and currentPage resets to 1]. Type: Task.
  [ID-11.3.2] [UI/STATE]: [1. Create frontend/src/hooks/useReferencesTable.js. 2. Initialize useState for currentPage (default 1) and searchQuery (default ''). 3. Create a derived array filteredData filtering input data where title or author includes searchQuery (case-insensitive). 4. Create paginatedData by slicing filteredData from (currentPage - 1) * pageSize to currentPage * pageSize. 5. Export searchQuery, setSearchQuery, currentPage, setCurrentPage, paginatedData, and totalPages]. Type: Task.
  [ID-11.3.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md and check - [ ] for Story 11.3. 2. Append &gt; Files touched: useReferencesTable.js, useReferencesTable.test.js under the story. 3. Open global_backlog.md and check - [ ] for [REQ-034]]. Type: Task.

- [x] Story 11.4: References Table Dumb View Wiring | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Wire the UI Table to consume the custom hook, rendering the search bar and pagination controls. (&lt;-- REQ-035)
  &gt; Files touched: ReferencesDataTable.jsx, ReferencesDataTable.test.jsx
  Story Context Radius: {"frontend/src/components/references/ReferencesDataTable.jsx": [""], "frontend/src/hooks/useReferencesTable.js": [""], "leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-11.4.1] [TESTING/TDE]: [1. Arrange: Render ReferencesDataTable with a mock data array. 2. Act: Click the "Next" pagination button. 3. Assert: Verify the table rows update to reflect the next page chunk of data]. Type: Task.
  [ID-11.4.2] [UI/VIEW]: [1. Open frontend/src/components/references/ReferencesDataTable.jsx. 2. Import and invoke useReferencesTable(data, 13). 3. Add a search &lt;input&gt; above the table bound to searchQuery. 4. Render the &lt;tbody&gt; using paginatedData.map. 5. Add a pagination &lt;div&gt; below the table with "Previous" and "Next" buttons wired to setCurrentPage, disabled appropriately based on currentPage and totalPages]. Type: Task.
  [ID-11.4.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_11_references_ui_and_bugfixes.md and check - [ ] for Story 11.4. 2. Append &gt; Files touched: ReferencesDataTable.jsx under the story. 3. Open global_backlog.md and check - [ ] for [REQ-035]]. Type: Task.