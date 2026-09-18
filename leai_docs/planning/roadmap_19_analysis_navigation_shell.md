---
type: "roadmap"
epic_name: "ANALYSIS NAVIGATION SHELL ARCHITECTURE"
domain: "Frontend UI/State"
complexity_aggregate: "MEDIUM"
---

# EPIC 19: ANALYSIS NAVIGATION SHELL ARCHITECTURE | FRONTEND VERTICAL

- [x] Story 19.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-19.0.1] [PLANNING/INIT]: [1. Create/Verify leai_docs/planning/ path. 2. Append EPIC 19, REQ-056 through REQ-059, and this Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_19_analysis_navigation_shell.md]. Type: Task.

- [ ] Story 19.1: Configuration Tree & Navigation Hook | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-057)
  Business Requirement: Define the static menu structure and create a custom React hook to manage active categories and tabs. Pure logic, zero UI.
  Story Context Radius: {"frontend/src/config/analysisMenuConfig.js": [""], "frontend/src/hooks/useAnalysisNavigation.js": [""], "frontend/src/hooks/useAnalysisNavigation.test.js": [""], "context.md": [""], "leai_docs/planning/roadmap_19_analysis_navigation_shell.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-19.1.1] [TESTING/TDE]: [1. Arrange: Write a failing test for useAnalysisNavigation expecting activeCategory, activeTab, setActiveCategory, and setActiveTab to exist. 2. Act: Call setActiveCategory('network-analysis'). 3. Assert: Verify activeCategory is updated and activeTab strictly resets to the first child tab (co-authorship) defined in the mocked config]. Type: Task.
  - [ID-19.1.2] [CORE/LOGIC]: [1. Create frontend/src/config/analysisMenuConfig.js. 2. Export a constant array containing the 6 requested categories and their 25+ respective sub-tabs using strictly string IDs and string Labels. 3. Export as a primitive JSON structure]. Type: Task.
  - [ID-19.1.3] [CORE/STATE]: [1. Create frontend/src/hooks/useAnalysisNavigation.js. 2. Implement the state logic to initialize with the first category and its first tab from the config. 3. Implement the reset-to-first-tab cascade logic when a category changes]. Type: Task.
  - [ID-19.1.4] [DOCUMENTATION/SYNC]: [1. Open context.md. 2. Document the creation of analysisMenuConfig and useAnalysisNavigation under the Frontend Architecture section]. Type: Task.
  - [ID-19.1.5] [PLANNING/SYNC]: [1. Open roadmap_19_analysis_navigation_shell.md and check - [x] for Story 19.1. 2. Append > Files touched: ... under the story. 3. Check - [x] for REQ-057 in global_backlog.md]. Type: Task.

- [ ] Story 19.2: Analysis Sidebar Pure Dumb View | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- REQ-058)
  Business Requirement: Create the left sidebar visual component. It MUST NOT maintain internal state. It strictly receives configuration and callback functions via props.
  Story Context Radius: {"frontend/src/components/analysis/AnalysisSidebar.jsx": [""], "frontend/src/components/analysis/AnalysisSidebar.test.jsx": [""], "frontend/src/config/analysisMenuConfig.js": [""], "leai_docs/planning/roadmap_19_analysis_navigation_shell.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-19.2.1] [TESTING/TDE]: [1. Arrange: Write a failing test mounting AnalysisSidebar with a mock config and vi.fn() for callbacks. 2. Act: Simulate a click on a nested tab element. 3. Assert: Ensure onSelectTab was called with the exact primitive string ID, verifying pure DTO boundary]. Type: Task.
  - [ID-19.2.2] [UI/COMPONENT]: [1. Create frontend/src/components/analysis/AnalysisSidebar.jsx. 2. Implement a dumb view accepting props: config, activeCategory, activeTab, onSelectCategory, onSelectTab. 3. Map over the config to render the category list and nested active tabs using strict dark-mode inline styles (or existing CSS classes)]. Type: Task.
  - [ID-19.2.3] [PLANNING/SYNC]: [1. Open roadmap_19_analysis_navigation_shell.md and check - [x] for Story 19.2. 2. Append > Files touched: .... 3. Check - [x] for REQ-058 in global_backlog.md]. Type: Task.

- [ ] Story 19.3: Dynamic Content Renderer Dumb View | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-059)
  Business Requirement: Create a central content area that routes tab IDs to generic placeholder views.
  Story Context Radius: {"frontend/src/components/analysis/AnalysisContent.jsx": [""], "frontend/src/components/analysis/AnalysisContent.test.jsx": [""], "leai_docs/planning/roadmap_19_analysis_navigation_shell.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-19.3.1] [TESTING/TDE]: [1. Arrange: Write a failing test rendering AnalysisContent with activeTabId="co-authorship". 2. Act: Query the DOM. 3. Assert: Verify the string "Placeholder for co-authorship" exists, confirming the routing switch works]. Type: Task.
  - [ID-19.3.2] [UI/COMPONENT]: [1. Create frontend/src/components/analysis/AnalysisContent.jsx. 2. Accept prop activeTabId. 3. Implement a switch/map mechanism returning a simple flexbox <div> placeholder displaying the activeTabId string]. Type: Task.
  - [ID-19.3.3] [PLANNING/SYNC]: [1. Open roadmap_19_analysis_navigation_shell.md and check - [x] for Story 19.3. 2. Append > Files touched: .... 3. Check - [x] for REQ-059 in global_backlog.md]. Type: Task.

- [ ] Story 19.4: View Wiring & Container Architecture | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-056)
  Business Requirement: Wire the state hook and the dumb components inside the main AnalysisView.
  Story Context Radius: {"frontend/src/views/AnalysisView.jsx": [""], "frontend/src/views/AnalysisView.test.jsx": [""], "frontend/src/hooks/useAnalysisNavigation.js": [""], "frontend/src/components/analysis/AnalysisSidebar.jsx": [""], "frontend/src/components/analysis/AnalysisContent.jsx": [""], "frontend/src/config/analysisMenuConfig.js": [""], "leai_docs/planning/roadmap_19_analysis_navigation_shell.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-19.4.1] [TESTING/TDE]: [1. Arrange: Write an integration test for AnalysisView.jsx. Mock the hook. 2. Act: Render the component. 3. Assert: Verify both the Sidebar and Content areas are successfully injected and visible in the DOM]. Type: Task.
  - [ID-19.4.2] [UI/WIRING]: [1. Open frontend/src/views/AnalysisView.jsx. 2. Remove static content. Replace with a flexbox row container. 3. Instantiate useAnalysisNavigation(). 4. Inject state variables and callbacks into <AnalysisSidebar /> and activeTab into <AnalysisContent />]. Type: Task.
  - [ID-19.4.3] [PLANNING/SYNC]: [1. Open roadmap_19_analysis_navigation_shell.md and check - [x] for Story 19.4. 2. Append > Files touched: .... 3. Check - [x] for REQ-056 in global_backlog.md]. Type: Task.