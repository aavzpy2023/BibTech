---
type: "roadmap"
epic_name: "Batch Load Interface"
domain: "Frontend UI"
complexity_aggregate: "MEDIUM"
---

# EPIC 3: BATCH LOAD INTERFACE | [ISOLATED VERTICAL]

- [x] Story 2.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  > Files touched: leai_docs/planning/roadmap_2_batch_load.md, leai_docs/planning/global_backlog.md
  Business Requirement: Initialize sequential agentic memory state trackers ensuring
  DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:

  [ID-2.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing.
  2. Append EPIC 3, its [REQ-004] to [REQ-007] list, and the Roadmap link to
  leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response
  (INCLUDING the YAML Frontmatter block above) into
  leai_docs/planning/roadmap_2_batch_load.md]. Type: Task.

- [x] Story 2.1: Frontend Routing & Main Layout | [MoSCoW: MUST] | [Complexity: EASY]
  > Files touched: frontend/package.json, frontend/src/App.jsx, frontend/src/components/Layout.jsx, frontend/src/components/Layout.test.jsx
  Business Requirement: Implement Main Navigation Tabs using client-side routing.
  (<-- REQ-004)
  Story Context Radius: {"frontend/package.json": [""], "frontend/src/App.jsx": [""],
  "frontend/src/components/Layout.jsx": [""],
  "frontend/src/components/Layout.test.jsx": [""],
  "leai_docs/planning/roadmap_2_batch_load.md": [""],
  "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:

  [ID-2.1.1] [CORE/DEPENDENCIES]: [1. Add react-router-dom to
  frontend/package.json dependencies. 2. Run npm install inside the frontend
  container/directory]. Type: Task.
  [ID-2.1.2] [TESTING/TDE]: [1. Arrange: Mock react-router-dom MemoryRouter.
  2. Act: Render <Layout />. 3. Assert: Verify navigation links (Dashboard,
  Search, Load, Download queue, References) exist in the DOM]. Type: Task.
  [ID-2.1.3] [UI/VIEW]: [1. Create frontend/src/components/Layout.jsx. 2. Implement
  a dumb navigation bar with NavLink components for the 5 tabs. 3. Render an
  <Outlet /> below the navigation]. Type: Task.
  [ID-2.1.4] [UI/WIRING]: [1. Open frontend/src/App.jsx. 2. Wrap the application
  in BrowserRouter. 3. Define Routes with Layout as the parent route. 4. Map the
  /load route to a temporary <div>Load View</div> placeholder]. Type: Task.
  [ID-2.1.5] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_2_batch_load.md
  and check - [x] for Story 2.1. 2. Append > Files touched: frontend/package.json,
  frontend/src/App.jsx, frontend/src/components/Layout.jsx,
  frontend/src/components/Layout.test.jsx under the story. 3. Open
  leai_docs/planning/global_backlog.md and check - [x] for REQ-004]. Type: Task.

- [x] Story 2.2: Load View - State Fractality (Custom Hook) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  > Files touched: frontend/src/hooks/useBatchLoad.js, frontend/src/hooks/useBatchLoad.test.js
  Business Requirement: Isolate all state logic for the Batch Load view into a
  custom hook. (<-- REQ-005, REQ-006, REQ-007)
  Story Context Radius: {"frontend/src/hooks/useBatchLoad.js": [""],
  "frontend/src/hooks/useBatchLoad.test.js": [""],
  "leai_docs/planning/roadmap_2_batch_load.md": [""],
  "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:

  [ID-2.2.1] [TESTING/TDE]: [1. Arrange: Import renderHook from testing library.
  2. Act: Render useBatchLoad and call updateConfig({ delay: 15 }). 3. Assert:
  Verify result.current.config.delay equals 15]. Type: Task.
  [ID-2.2.2] [UI/STATE]: [1. Create frontend/src/hooks/useBatchLoad.js.
  2. Initialize useState for input (files, dois), config (delay, sources,
  destination, email), and monitor (progress, total, logs). 3. Export the state
  objects and their respective primitive updater functions (updateInput,
  updateConfig, startBatch)]. Type: Task.
  [ID-2.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_2_batch_load.md
  and check - [x] for Story 2.2. 2. Append > Files touched:
  frontend/src/hooks/useBatchLoad.js, frontend/src/hooks/useBatchLoad.test.js
  under the story]. Type: Task.

- [x] Story 2.3: Load View - Dumb Components (Input & Config) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  > Files touched: frontend/src/components/load/BatchInput.jsx, frontend/src/components/load/BatchConfig.jsx, frontend/src/components/load/BatchComponents.test.jsx
  Business Requirement: Implement pure UI components for Input and Configuration,
  strictly receiving primitive props. (<-- REQ-005, REQ-006)
  Story Context Radius: {"frontend/src/components/load/BatchInput.jsx": [""],
  "frontend/src/components/load/BatchConfig.jsx": [""],
  "frontend/src/components/load/BatchComponents.test.jsx": [""],
  "leai_docs/planning/roadmap_2_batch_load.md": [""],
  "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:

  [ID-2.3.1] [TESTING/TDE]: [1. Arrange: Create mock functions onInputUpdate and
  onConfigUpdate. 2. Act: Render <BatchInput /> and <BatchConfig /> with mocks.
  3. Assert: Verify dropzone, textarea, slider, and checkboxes render correctly].
  Type: Task.
  [ID-2.3.2] [UI/VIEW]: [1. Create frontend/src/components/load/BatchInput.jsx.
  2. Implement a react-dropzone area and a <textarea> for DOIs. 3. Wire inputs
  to trigger the onInputUpdate prop with primitive values]. Type: Task.
  [ID-2.3.3] [UI/VIEW]: [1. Create frontend/src/components/load/BatchConfig.jsx.
  2. Implement a range slider (5,15,30,60), 5 checkboxes (Unpaywall, etc.), and 2
  text inputs (Folder, Email). 3. Wire inputs to trigger the onConfigUpdate prop].
  Type: Task.
  [ID-2.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_2_batch_load.md
  and check - [x] for Story 2.3. 2. Append > Files touched:
  frontend/src/components/load/BatchInput.jsx,
  frontend/src/components/load/BatchConfig.jsx,
  frontend/src/components/load/BatchComponents.test.jsx under the story. 3. Open
  leai_docs/planning/global_backlog.md and check - [x] for REQ-005 and REQ-006].
  Type: Task.

- [ ] Story 2.4: Load View - Dumb Component (Monitor) & Assembly | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement the Monitor UI and assemble the final Load View
  by wiring the hook to the dumb components. (<-- REQ-007)
  Story Context Radius: {"frontend/src/components/load/BatchMonitor.jsx": [""],
  "frontend/src/views/LoadView.jsx": [""], "frontend/src/App.jsx": [""],
  "leai_docs/planning/roadmap_2_batch_load.md": [""],
  "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:

  [ID-2.4.1] [TESTING/TDE]: [1. Arrange: Define mock props progress={45},
  total={344}, logs=["Log 1"]. 2. Act: Render <BatchMonitor />. 3. Assert:
  Verify progress bar width and log text render correctly]. Type: Task.
  [ID-2.4.2] [UI/VIEW]: [1. Create frontend/src/components/load/BatchMonitor.jsx.
  2. Implement a "Start Download" button triggering onStart. 3. Implement a visual
  progress bar and a scrollable <div> mapping over the logs array prop]. Type: Task.
  [ID-2.4.3] [UI/WIRING]: [1. Create frontend/src/views/LoadView.jsx. 2. Call
  useBatchLoad() to extract state and updaters. 3. Render <BatchInput>,
  <BatchConfig>, and <BatchMonitor>, passing the extracted state and updaters
  as primitive props]. Type: Task.
  [ID-2.4.4] [UI/WIRING]: [1. Open frontend/src/App.jsx. 2. Replace the temporary
  /load route placeholder with the imported LoadView component]. Type: Task.
  [ID-2.4.5] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_2_batch_load.md
  and check - [x] for Story 2.4. 2. Append > Files touched:
  frontend/src/components/load/BatchMonitor.jsx, frontend/src/views/LoadView.jsx,
  frontend/src/App.jsx under the story. 3. Open
  leai_docs/planning/global_backlog.md and check - [x] for REQ-007]. Type: Task.