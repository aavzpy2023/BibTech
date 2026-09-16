---
type: "roadmap"
epic_name: "EPIC 14: REFERENCES TABLE RESIZING & COUNT FIX"
domain: "Frontend UI"
complexity_aggregate: "MEDIUM"
---

# EPIC 14: REFERENCES TABLE RESIZING & COUNT FIX | FRONTEND ISOLATED

- [x] Story 13.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
Layered Technical Breakdown:
[ID-13.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append "EPIC 14: REFERENCES TABLE RESIZING & COUNT FIX", its [REQ-040], [REQ-041] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_13_references_table_resizing_and_count_fix.md]. Type: Task.

- [ ] Story 13.1: Synchronize and Clarify Imported vs. Displayed References Count | [MoSCoW: MUST] | [Complexity: EASY]
Story Context Radius: {"frontend/src/hooks/useReferencesUpload.js": [""], "frontend/src/components/references/UploadReferencesModal.jsx": [""], "leai_docs/planning/roadmap_13_references_table_resizing_and_count_fix.md": [""], "leai_docs/planning/global_backlog.md": [""]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-13.1.1] [TESTING/TDE]: [1. Arrange: Mock fetch to return successful injection (inserted: 2) and successful upload/parse (array length: 5). 2. Act: Render useReferencesUpload hook and call uploadAndInject. 3. Assert: Verify insertedCount is 2 and parsedCount is 5]. Type: Task.
[ID-13.1.2] [FRONTEND/STATE]: [1. Open useReferencesUpload.js. 2. Add a new state parsedCount initialized to null. 3. In uploadAndInject, after the allParsed array is populated, set parsedCount to allParsed.length. 4. Return parsedCount in the hook's return object]. Type: Task.
[ID-13.1.3] [FRONTEND/VIEW]: [1. Open UploadReferencesModal.jsx. 2. Extract parsedCount from the hook props. 3. Update the isSuccess UI block to display both counts: "Parsed X references from file. Inserted Y new references into project."]. Type: Task.
[ID-13.1.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_13_references_table_resizing_and_count_fix.md and check - [x] for Story 13.1. 2. Append > Files touched: useReferencesUpload.js, UploadReferencesModal.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-040]]. Type: Task.

- [x] Story 13.2: Resizable Table Columns - State Fractality (Custom Hook) | [MoSCoW: MUST] | [Complexity: MEDIUM]
> Files touched: useTableResize.js, useTableResize.test.js
Story Context Radius:
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-13.2.1] [TESTING/TDE]: [1. Arrange: Render useTableResize hook with initial widths. 2. Act: Simulate handleMouseDown on a column, then dispatch mousemove on the window with a positive X delta, then mouseup. 3. Assert: Verify the target column's width state has increased and respects minimum width constraints]. Type: Task.
[ID-13.2.2] [FRONTEND/STATE]: [1. Create useTableResize.js. 2. Implement state colWidths (defaulting to { title: 45, author: 20, year: 10, journal: 25 }) and isResizing (tracking active column and start X). 3. Implement handleMouseDown(e, colName), handleMouseMove(e), and handleMouseUp(). 4. Attach/detach mousemove and mouseup to window via useEffect when isResizing is active. 5. Return { colWidths, handleMouseDown }]. Type: Task.
[ID-13.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_13_references_table_resizing_and_count_fix.md and check - [x] for Story 13.2. 2. Append > Files touched: useTableResize.js, useTableResize.test.js under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-041]]. Type: Task.

- [x] Story 13.3: Resizable Table Columns - Dumb View Wiring | [MoSCoW: MUST] | [Complexity: EASY]
> Files touched: ReferencesDataTable.jsx, ReferencesDataTable.test.jsx
Story Context Radius:
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-13.3.1] [TESTING/TDE]: [1. Arrange: Render ReferencesDataTable with mock data. 2. Act: Verify <th> elements contain the resize handle <div>. 3. Assert: Verify <th> elements apply the width styles provided by the hook]. Type: Task.
[ID-13.3.2] [FRONTEND/VIEW]: [1. Open ReferencesDataTable.jsx. 2. Import and invoke useTableResize(). 3. Inject a vertical resize handle (<div style={{ cursor: 'col-resize', width: '5px', position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: 'transparent' }} onMouseDown={(e) => handleMouseDown(e, 'colName')}>) into each <th>. 4. Ensure <th> has position: 'relative' and applies the width from colWidths state (e.g., width: `${colWidths.title}%`). 5. Ensure retains overflow: hidden and textOverflow: 'ellipsis']. Type: Task.
[ID-13.3.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_13_references_table_resizing_and_count_fix.md and check - [x] for Story 13.3. 2. Append > Files touched: ReferencesDataTable.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-041]]. Type: Task.