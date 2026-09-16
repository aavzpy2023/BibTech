---
type: "roadmap"
epic_name: "EPIC 16: METADATA HOVER-REVEAL UI"
domain: "Frontend UI"
complexity_aggregate: "MEDIUM"
---

# EPIC 16: METADATA HOVER-REVEAL UI | FRONTEND ISOLATED

- [x] Story 16.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-16.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 16, its [REQ-046] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_16_metadata_hover_reveal.md]. Type: Task.

- [x] Story 16.1: State Fractality - Hover Logic Hook | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Isolate the coordinate tracking and hover state management from the UI components.
  Story Context Radius: {"frontend/src/hooks/useHoverReveal.js": [""], "frontend/src/hooks/useHoverReveal.test.js": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-16.1.1] [TESTING/TDE]: [1. Arrange: In useHoverReveal.test.js, use @testing-library/react-hooks to renderHook(() => useHoverReveal()). 2. Act: Call result.current.onMouseEnter('author', 'John Doe', { clientX: 100, clientY: 200 }). 3. Assert: Verify result.current.hoverInfo strictly matches { key: 'author', value: 'John Doe', x: 100, y: 200, isVisible: true }]. Type: Task.
  [ID-16.1.2] [UI/STATE]: [1. Create frontend/src/hooks/useHoverReveal.js. 2. Implement useState for hoverInfo initialized to null. 3. Export onMouseEnter(key, val, e), onMouseMove(e) (updates x,y), and onMouseLeave() (sets isVisible to false or null). 4. Ensure logic is under 25 lines]. Type: Task.

- [ ] Story 16.2: Dumb View Componentization - Grid & Popover | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- REQ-16.1)
  Business Requirement: Create strictly dumb, stateless UI components for rendering the metadata grid and the floating popover.
  Story Context Radius: {"frontend/src/components/references/MetadataGrid.jsx": [""], "frontend/src/components/references/HoverPopover.jsx": [""], "frontend/src/components/references/ReferencesDataTable.jsx": ["styles"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-16.2.1] [TESTING/TDE]: [1. Arrange: Mount <HoverPopover info={{key: 'test', value: 'data', x: 10, y: 10, isVisible: true}} />. 2. Act: Render component. 3. Assert: Verify a div exists with absolute positioning at top: 25px (y+15), left: 25px (x+15) containing 'data']. Type: Task.
  [ID-16.2.2] [UI/VIEW]: [1. Create HoverPopover.jsx. 2. Implement a pure functional component that returns null if !info?.isVisible. 3. Return a div using the styles.popover definition (copy from ReferencesDataTable.jsx or inline it) dynamically positioned at left: info.x + 15, top: info.y + 15]. Type: Task.
  [ID-16.2.3] [UI/VIEW]: [1. Create MetadataGrid.jsx. 2. Accept props: data (object), onHover, onMove, onLeave. 3. Iterate Object.entries(data). 4. Render a grid of labels (keys) using styles.auditItemBox. 5. Attach the mouse event props to each label, passing (key, value, e) to onHover]. Type: Task.

- [ ] Story 16.3: View Wiring - ReferencesDataTable Integration | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-16.2)
  Business Requirement: Surgically replace the bloated hardcoded modal body with the new fractured components.
  Story Context Radius: {"frontend/src/components/references/ReferencesDataTable.jsx": [""], "frontend/src/hooks/useHoverReveal.js": ["export"], "frontend/src/components/references/MetadataGrid.jsx": ["export"], "frontend/src/components/references/HoverPopover.jsx": ["export"], "context.md": [""], "leai_docs/planning/roadmap_16_metadata_hover_reveal.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-16.3.1] [TESTING/TDE]: [1. Arrange: In ReferencesDataTable.test.jsx, mock MetadataGrid and HoverPopover. 2. Act: Trigger modal open with a selected row. 3. Assert: Verify MetadataGrid is called with the selectedRow data prop]. Type: Task.
  [ID-16.3.2] [UI/WIRING]: [1. Open ReferencesDataTable.jsx. 2. Import useHoverReveal, MetadataGrid, and HoverPopover. 3. Initialize the hook at the top of the component. 4. Delete the entire hardcoded div structure inside <Modal>. 5. Inject <MetadataGrid> and <HoverPopover> passing the hook's state and handlers]. Type: Task.
  [ID-16.3.3] [DOCUMENTATION/SYNC]: [1. Open context.md at root. 2. Document the extraction of MetadataGrid and HoverPopover enforcing State Fractality]. Type: Task.
  [ID-16.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_16_metadata_hover_reveal.md and check - [x] for Story 16.3. 2. Append > Files touched: [list of modified/read files] under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-046]]. Type: Task.