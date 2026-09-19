---
type: "roadmap"
epic_name: "PROFESSIONAL NETWORK VISUALIZATION & TEMPLATING"
domain: "Frontend/Visualization"
complexity_aggregate: "HARD"
---

# EPIC 21: PROFESSIONAL NETWORK VISUALIZATION & TEMPLATING | VISUALIZATION LAYER

- [x] Story 21.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  - Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  - Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  - Layered Technical Breakdown:
    - [ID-21.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 21, its [REQ-060] to [REQ-065] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_21_professional_network_visualization.md]. Type: Task.

- [x] Story 21.1: Backend Topology Refactor & Boundary Marshal | [MoSCoW: MUST] | [Complexity: EASY]
  > Files touched: backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py
  - Business Requirement: Strip presentation logic from backend. API must return strict topological primitives.
  - Story Context Radius: {"backend/src/bibliography/router.py": ["def get_coauthorship_network"], "backend/tests/bibliography/test_router.py": ["*"]}
  - Layered Technical Breakdown:
    - [ID-21.1.1] [TESTING/TDE]: [1. Arrange: Mock DB session returning 3 linked articles. 2. Act: Call get_coauthorship_network. 3. Assert: Verify response nodes contain id, name, group but assert x, y, z, theta, r_2d are strictly undefined]. Type: Task.
    - [ID-21.1.2] [LOGIC/CORE]: [1. Open router.py. 2. In get_coauthorship_network, delete all lines calculating r_2d, angle_offset, jitter, theta, x, y, z. 3. Update the nodes.append dictionary to yield only primitive DTOs: id, name, papers, citations, avgYear, group]. Type: Task.
    - [ID-21.1.3] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.1. 2. Append > Files touched: backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py under the story. 3. Open global_backlog.md and check - [x] for [REQ-060]]. Type: Task.

- [x] Story 21.2: Frontend Semantic Primitives & Styles | [MoSCoW: MUST] | [Complexity: EASY] (<-- REQ-060)
  > Files touched: frontend/src/views/analysis/network/networkStyles.js, frontend/src/views/analysis/network/networkData.js
  - Business Requirement: Establish isolated, pure functions for network aesthetics and data validation.
  - Story Context Radius: {"frontend/src/views/analysis/network/networkStyles.js": [""], "frontend/src/views/analysis/network/networkData.js": [""]}
  - Layered Technical Breakdown:
    - [ID-21.2.1] [TESTING/TDE]: [1. Arrange: Define mock node data with varying metrics. 2. Act: Call getNodeColor(group) and calculateRadius(papers). 3. Assert: Verify correct hex codes (#3b82f6, #ef4444, #10b981) and bounded radius values are returned]. Type: Task.
    - [ID-21.2.2] [LOGIC/CORE]: [1. Create networkStyles.js. 2. Export pure functions getNodeColor(group) and calculateRadius(metric) using a controlled scale. 3. Create networkData.js exporting pure function filterNetworkData(nodes, links, minWeight) to strip weak links and orphaned nodes]. Type: Task.
    - [ID-21.2.3] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.2. 2. Append > Files touched: frontend/src/views/analysis/network/networkStyles.js, frontend/src/views/analysis/network/networkData.js under the story. 3. Open global_backlog.md and check - [x] for [REQ-061]]. Type: Task.

- [x] Story 21.3: Static D3 Force Layout Engine (State Logic) | [MoSCoW: MUST] | [Complexity: HARD] (<-- REQ-061)
  > Files touched: frontend/src/views/analysis/network/networkLayout.js, frontend/src/views/analysis/network/networkLayout.test.js
  - Business Requirement: Pre-calculate network physics synchronously to freeze the layout.
  - Story Context Radius: {"frontend/src/views/analysis/network/networkLayout.js": ["*"]}
  - Layered Technical Breakdown:
    - [ID-21.3.1] [TESTING/TDE]: [1. Arrange: Mock 5 nodes and 4 links. 2. Act: Call calculateStaticLayout(nodes, links, 800, 600). 3. Assert: Verify returned nodes have fx and fy properties populated with valid numbers]. Type: Task.
    - [ID-21.3.2] [LOGIC/CORE]: [1. Create networkLayout.js. 2. Import d3-force. 3. Implement calculateStaticLayout(nodes, links, width, height). 4. Initialize forceSimulation(nodes), apply forceCenter, forceManyBody (repulsion), forceLink(links), and forceCollide. 5. Run simulation.tick(300) synchronously. 6. Map resulting x, y to fx, fy to freeze positions and return the mutated arrays]. Type: Task.
    - [ID-21.3.3] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.3. 2. Append > Files touched: frontend/src/views/analysis/network/networkLayout.js under the story. 3. Open global_backlog.md and check - [x] for [REQ-062]]. Type: Task.

- [x] Story 21.4: Canvas Micro-Rendering (Nodes & Links) | [MoSCoW: MUST] | [Complexity: HARD] (<-- REQ-062)
  > Files touched: frontend/src/views/analysis/network/networkRender.js, frontend/src/views/analysis/network/networkRender.test.js
  - Business Requirement: Override default canvas drawing to implement radial gradients and smooth bezier curves.
  - Story Context Radius: {"frontend/src/views/analysis/network/networkRender.js": [""], "frontend/src/views/analysis/network/networkStyles.js": [""]}
  - Layered Technical Breakdown:
    - [ID-21.4.1] [TESTING/TDE]: [1. Arrange: Mock CanvasRenderingContext2D. 2. Act: Call drawNode and drawLink. 3. Assert: Verify ctx.createRadialGradient and ctx.bezierCurveTo were called with expected arguments]. Type: Task.
    - [ID-21.4.2] [LOGIC/CORE]: [1. Create networkRender.js. 2. Implement drawNode(node, ctx, globalScale) using ctx.createRadialGradient for a 3D-like sphere effect based on networkStyles.js colors. 3. Implement drawLink(link, ctx, globalScale) using ctx.beginPath() and ctx.bezierCurveTo for smooth, arrow-less lines with opacity mapped to link weight]. Type: Task.
    - [ID-21.4.3] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.4. 2. Append > Files touched: frontend/src/views/analysis/network/networkRender.js under the story. 3. Open global_backlog.md and check - [x] for [REQ-063]]. Type: Task.

- [x] Story 21.5: Canvas Micro-Rendering (Labels & Branding) | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- REQ-063)
  > Files touched: frontend/src/views/analysis/network/networkRender.js, frontend/src/views/analysis/network/networkRender.test.js
  - Business Requirement: Render professional typography with collision prevention and the NovaScope watermark.
  - Story Context Radius: {"frontend/src/views/analysis/network/networkRender.js": ["*"]}
  - Layered Technical Breakdown:
    - [ID-21.5.1] [TESTING/TDE]: [1. Arrange: Mock Canvas context and a node. 2. Act: Call drawLabel. 3. Assert: Verify ctx.fillText is called with the node name and correct offset]. Type: Task.
    - [ID-21.5.2] [LOGIC/CORE]: [1. In networkRender.js, implement drawLabel(node, ctx, globalScale) drawing text only if globalScale > threshold, using dark blue sans-serif, offset from the node radius. 2. Implement drawBranding(ctx, width, height) to draw "NOVASCOPE" in the bottom right corner of the canvas]. Type: Task.
    - [ID-21.5.3] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.5. 2. Append > Files touched: frontend/src/views/analysis/network/networkRender.js under the story. 3. Open global_backlog.md and check - [x] for [REQ-063]]. Type: Task.

- [x] Story 21.6: Network Template State Fractality (Hook & Dumb View) | [MoSCoW: MUST] | [Complexity: HARD] (<-- REQ-064)
  > Files touched: frontend/src/hooks/useNetworkLayout.js, frontend/src/components/analysis/NetworkGraphTemplate.jsx, frontend/src/hooks/useNetworkLayout.test.js
  - Business Requirement: Strictly separate layout calculation state from the Canvas rendering view.
  - Story Context Radius: {"frontend/src/hooks/useNetworkLayout.js": [""], "frontend/src/components/analysis/NetworkGraphTemplate.jsx": [""], "frontend/src/views/analysis/network/networkLayout.js": [""], "frontend/src/views/analysis/network/networkRender.js": [""]}
  - Layered Technical Breakdown:
    - [ID-21.6.1] [TESTING/TDE]: [1. Arrange: Mount useNetworkLayout with mock data. 2. Act: Wait for effect. 3. Assert: Verify hook returns isCalculating: false and frozenData with fx/fy]. Type: Task.
    - [ID-21.6.2] [STATE/HOOK]: [1. Create useNetworkLayout.js. 2. Implement a useEffect that takes raw nodes/links, calls calculateStaticLayout (optionally in a timeout to not block UI thread entirely during the 300 ticks), and sets frozenData state]. Type: Task.
    - [ID-21.6.3] [UI/VIEW]: [1. Create NetworkGraphTemplate.jsx. 2. Accept frozenData as prop. 3. Render ForceGraph2D passing frozenData, cooldownTicks={0}, and injecting drawNode, drawLink, and drawLabel into nodeCanvasObject and linkCanvasObject. 4. Inject drawBranding into onRenderFramePost]. Type: Task.
    - [ID-21.6.4] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.6. 2. Append > Files touched: frontend/src/hooks/useNetworkLayout.js, frontend/src/components/analysis/NetworkGraphTemplate.jsx under the story. 3. Open global_backlog.md and check - [x] for [REQ-064]]. Type: Task.

- [ ] Story 21.7: CoAuthorship Integration (State Fractality & Export) | [MoSCoW: MUST] | [Complexity: HARD] (<-- REQ-065)
  - Business Requirement: Wire the new template to the CoAuthorship view, strip old 3D logic, and implement high-res export.
  - Story Context Radius: {"frontend/src/hooks/useCoAuthorshipNetwork.js": [""], "frontend/src/views/analysis/CoAuthorshipNetwork.jsx": [""], "frontend/src/views/analysis/network/exportNetwork.js": ["*"]}
  - Layered Technical Breakdown:
    - [ID-21.7.1] [TESTING/TDE]: [1. Arrange: Mock useCoAuthorshipNetwork. 2. Act: Call hook. 3. Assert: Verify 3D rotation state is completely removed and only raw data/minWeight state remains]. Type: Task.
    - [ID-21.7.2] [STATE/HOOK]: [1. Refactor useCoAuthorshipNetwork.js. 2. Delete all 3D projection logic, rotation, is3DMode, projectedNodes, and drag handlers. 3. Return raw nodes and links directly after fetching]. Type: Task.
    - [ID-21.7.3] [LOGIC/EXPORT]: [1. Create exportNetwork.js. 2. Implement exportCanvasToImage(canvasRef, filename) ensuring a white background fill is applied before extracting the data URL]. Type: Task.
    - [ID-21.7.4] [UI/VIEW]: [1. Refactor CoAuthorshipNetwork.jsx. 2. Call useCoAuthorshipNetwork to get raw data. 3. Call useNetworkLayout to get frozen data. 4. Render NetworkGraphTemplate passing frozen data. 5. Wire the export button to call exportCanvasToImage]. Type: Task.
    - [ID-21.7.5] [PLANNING/SYNC]: [1. Open roadmap_21_professional_network_visualization.md and check - [x] for Story 21.7. 2. Append > Files touched: frontend/src/hooks/useCoAuthorshipNetwork.js, frontend/src/views/analysis/CoAuthorshipNetwork.jsx, frontend/src/views/analysis/network/exportNetwork.js under the story. 3. Open global_backlog.md and check - [x] for [REQ-065]]. Type: Task.