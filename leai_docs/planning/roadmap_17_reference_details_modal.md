---
type: "roadmap"
epic_name: "EPIC 17: REFERENCE DETAILS MODAL & BASE MODAL TEMPLATE ARCHITECTURE"
domain: "References UI & Database Verification"
complexity_aggregate: "HARD"
---

EPIC 17: REFERENCE DETAILS MODAL & BASE MODAL TEMPLATE ARCHITECTURE | [ISOLATED VERTICAL]

- [x] Story 17.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:

  [ID-17.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 17, its [REQ-047] through [REQ-051] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_17_reference_details_modal.md]. Type: Task.

- [x] Story 17.1: Backend Reference Serialization Audit & Boundary Marshal | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Guarantee that all persisted article metadata columns in PostgreSQL/SQLite are mapped to primitive DTOs via the REST endpoint.
  Story Context Radius: {"backend/src/bibliography/router.py": [""], "backend/src/database/models/core.py": ["READ_ONLY"], "backend/tests/bibliography/test_router.py": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.1.1] [TESTING/TDE]: [1. Arrange: Create unit test in test_router.py mocking db.query(Article) to return an Article entity explicitly populated with publisher, language, research_areas, web_of_science_categories, funding_text, journal_iso, oa_status, issn, times_cited, cited_references_count. 2. Act: Invoke get_project_references(project_code="TEST", db=mock_db). 3. Assert: Verify every attribute is mapped accurately to its primitive type in the returned dictionary]. Type: Task.
  [ID-17.1.2] [BACKEND/ROUTER]: [1. Open backend/src/bibliography/router.py. 2. In get_project_references, perform micro-surgery on the result.append() dictionary to extract and cast missing attributes from a (Article model) using _to_str() or int() where appropriate. 3. Validate no ORM instances leak]. Type: Task.
  [ID-17.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_17_reference_details_modal.md and check - [x] for Story 17.1. 2. Append > Files touched: router.py, test_router.py. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-047]]. Type: Task.
  > Files touched: router.py, test_router.py

- [x] Story 17.2: Reusable Base Modal Architecture (ModalTemplate) Dumb View | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Provide a dumb, dark-mode modal container with backdrop blur and flexible slots, stripped of any internal business logic.
  Story Context Radius: {"frontend/src/components/common/ModalTemplate.jsx": [""], "frontend/src/components/common/ModalTemplate.test.jsx": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.2.1] [TESTING/TDE]: [1. Arrange: Render ModalTemplate in ModalTemplate.test.jsx with isOpen={true} and a mock onClose callback. 2. Act: Query the DOM for the close button and click it. 3. Assert: Verify onClose executes exactly once and styling rules (blur, max-width) are present]. Type: Task.
  [ID-17.2.2] [FRONTEND/DUMB_VIEW]: [1. Create frontend/src/components/common/ModalTemplate.jsx. 2. Implement the backdrop overlay (backdropFilter: blur(6px)). 3. Implement the modal window (maxWidth: 1280px, maxHeight: 90vh, internal scroll) accepting purely standard React props (children, header, footer) without managing state]. Type: Task.
  [ID-17.2.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-048]]. Type: Task.
  > Files touched: ModalTemplate.jsx, ModalTemplate.test.jsx

- [x] Story 17.3: Reference Details - Hero Ribbon Dumb View | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Render the reference's multiline title, formatted author summary, and metrics ribbon as a pure presentational component.
  Story Context Radius: {"frontend/src/components/references/ReferenceHeroBlock.jsx": [""], "frontend/src/components/references/ReferenceHeroBlock.test.jsx": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.3.1] [TESTING/TDE]: [1. Arrange: Render ReferenceHeroBlock.test.jsx passing mock props (Title, Authors, Volume, DOI) and mock callbacks (onCopyDoi, onViewAuthors). 2. Act: Click the DOI copy button and the authors 'View all' link. 3. Assert: Verify both callbacks trigger with expected parameters]. Type: Task.
  [ID-17.3.2] [FRONTEND/DUMB_VIEW]: [1. Create frontend/src/components/references/ReferenceHeroBlock.jsx. 2. Render title and author tags based strictly on passed props. 3. Render horizontal metrics ribbon (Year, Journal, Volume, Issue, Pages, DOI), forcing '—' if Issue is null. Bind standard onClick props to buttons]. Type: Task.
  [ID-17.3.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-049]]. Type: Task.
  > Files touched: ReferenceHeroBlock.jsx, ReferenceHeroBlock.test.jsx

- [x] Story 17.4: Overview Tab - Left Column Dumb Views | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement the left column visual components (Abstract, Keywords, Research Areas) completely devoid of internal state manipulation.
  Story Context Radius: {"frontend/src/components/references/OverviewLeftColumn.jsx": [""], "frontend/src/components/references/OverviewLeftColumn.test.jsx": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.4.1] [TESTING/TDE]: [1. Arrange: Render OverviewLeftColumn.test.jsx with static mock abstract and keyword props. 2. Act: Click the 'View full abstract' span. 3. Assert: Verify the injected onExpand prop is executed]. Type: Task.
  [ID-17.4.2] [FRONTEND/DUMB_VIEW]: [1. Create frontend/src/components/references/OverviewLeftColumn.jsx. 2. Implement the Abstract preview container using CSS -webkit-line-clamp: 4. 3. Map passed arrays to Keywords and Web of Science chips, invoking passed onHoverInfo props on mouse enter]. Type: Task.
  [ID-17.4.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-050]]. Type: Task.
  > Files touched: OverviewLeftColumn.jsx, OverviewLeftColumn.test.jsx

- [ ] Story 17.5: Overview Tab - Right Column & Metrics Dumb Views | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement the right column (Affiliations, IDs, Funding) and footer metrics grids as pure visual functions.
  Story Context Radius: {"frontend/src/components/references/OverviewRightColumn.jsx": [""], "frontend/src/components/references/MetricsFooterCards.jsx": [""], "frontend/src/components/references/OverviewRightColumn.test.jsx": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.5.1] [TESTING/TDE]: [1. Arrange: Render both components in test with mock OA status and email string. 2. Act: Click copy email. 3. Assert: Verify the external onCopy prop is fired]. Type: Task.
  [ID-17.5.2] [FRONTEND/DUMB_VIEW]: [1. Create frontend/src/components/references/OverviewRightColumn.jsx. Render Affiliation/Funding boxes with external trigger links. 2. Create frontend/src/components/references/MetricsFooterCards.jsx. Render fixed-width grid properties and apply CSS conditionals for OA badge colors based strictly on passed strings]. Type: Task.
  [ID-17.5.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-050]]. Type: Task.

- [ ] Story 17.6: Secondary Deep-Dive Drawer Dumb View | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Build the slide-out panel for Lists and Authors as a dumb display component dependent entirely on parent props.
  Story Context Radius: {"frontend/src/components/references/ReferenceDrawer.jsx": [""], "frontend/src/components/references/ReferenceDrawer.test.jsx": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.6.1] [TESTING/TDE]: [1. Arrange: Render ReferenceDrawer.test.jsx passing isOpen=true, title="References", and an array of 5 mock items. 2. Act: Click close. 3. Assert: Verify onClose fires, and 5 mapped DOM elements exist]. Type: Task.
  [ID-17.6.2] [FRONTEND/DUMB_VIEW]: [1. Create frontend/src/components/references/ReferenceDrawer.jsx. 2. Define absolute positioning (right: 0, width: 500px) using conditional CSS transforms based on the isOpen prop. 3. Render dynamic content blocks matching the type prop (either citation list or author matrix) passing data blindly]. Type: Task.
  [ID-17.6.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-051]]. Type: Task.

- [ ] Story 17.7: State Fractality Enforcement (useReferenceDetails Hook) | [MoSCoW: MUST] | [Complexity: HARD]
  Business Requirement: Centralize and isolate ALL UI logic, formatting, tab switching, and Drawer/Tooltip visibility into a custom hook. Zero markup allowed here.
  Story Context Radius: {"frontend/src/hooks/useReferenceDetails.js": [""], "frontend/src/hooks/useReferenceDetails.test.js": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.7.1] [TESTING/TDE]: [1. Arrange: Render useReferenceDetails.test.js via @testing-library/react-hooks with a mock DB article object. 2. Act: Call setActiveTab('Metadata') and openDrawer('authors', data). 3. Assert: Expect result.current.activeTab to equal 'Metadata' and result.current.drawerState.isOpen to be true with corresponding payload]. Type: Task.
  [ID-17.7.2] [FRONTEND/HOOK]: [1. Create frontend/src/hooks/useReferenceDetails.js. 2. Define standard useState hooks for activeTab (default 'Overview'), drawerState (default hidden), and hoverInfo. 3. Export these states alongside curried dispatcher functions (handleCopy, handleExpandDrawer, handleTabChange)]. Type: Task.
  [ID-17.7.3] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Sync global backlog for [REQ-051]]. Type: Task.

- [ ] Story 17.8: Assembler, DI Wiring & DataTable Integration | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Wire the Dumb Views (17.2-17.6) and the State Hook (17.7) into ReferenceDetailsModal.jsx, and inject it securely into ReferencesDataTable.jsx.
  Story Context Radius: {"frontend/src/components/references/ReferenceDetailsModal.jsx": [""], "frontend/src/components/references/ReferencesDataTable.jsx": [""], "frontend/src/components/references/ReferencesDataTable.test.jsx": [""], "context.md": [""], "leai_docs/planning/roadmap_17_reference_details_modal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):

  [ID-17.8.1] [TESTING/TDE]: [1. Arrange: Render ReferencesDataTable.test.jsx. 2. Act: Select a row, simulating open intent. 3. Assert: Verify the unified ReferenceDetailsModal mounts with the injected row entity context without crashing]. Type: Task.
  [ID-17.8.2] [FRONTEND/WIRING]: [1. Create ReferenceDetailsModal.jsx. Invoke useReferenceDetails(). Pass the exact destructured states and callbacks to the child dumb components (ModalTemplate, ReferenceHeroBlock, OverviewLeftColumn, OverviewRightColumn, MetricsFooterCards, ReferenceDrawer). 2. Add Tab navigation markup bound strictly to the hook's active state. 3. Open ReferencesDataTable.jsx, delete the legacy inline modal code, and explicitly mount <ReferenceDetailsModal /> passing necessary open/close triggers]. Type: Task.
  [ID-17.8.3] [DOCUMENTATION/SYNC]: [1. Open context.md at root. 2. Document the strict Dumb View vs State Hook architecture applied to the Reference Details module]. Type: Task.
  [ID-17.8.4] [PLANNING/SYNC]: [1. Sync - [x] in roadmap. 2. Append touched files. 3. Open leai_docs/planning/global_backlog.md and verify all [REQ-047] to [REQ-051] are marked - [x]]. Type: Task.