---
type: "roadmap"
epic_name: "EPIC 1: BOOTSTRAP & ENVIRONMENT INITIALIZATION"
domain: "Data_Visualization"
complexity_aggregate: "HARD"
---

# EPIC 1: BOOTSTRAP & ENVIRONMENT INITIALIZATION | [DATA VISUALIZATION VERTICAL]

- [x] Story 1.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies for the new project.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-1.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Create leai_docs/planning/global_backlog.md and append EPIC 1 with REQs 001 through 014. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_1_novascope_d3.md]. Type: Task.

- [x] Story 1.1: Core Infrastructure & Semantic Primitives | [MoSCoW: MUST] | [Complexity: EASY]
  > Files touched: frontend/package.json, frontend/src/graph/types.ts, context.md
  Business Requirement: Install D3.js and establish the strict semantic type contracts for the graph data.
  Story Context Radius: {"package.json": [""], "src/graph/types.ts": [""], "context.md": [""], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-1.1.1] [CORE/LOGIC]: [1. Run npm install d3 and npm install -D @types/d3. 2. Create src/graph/types.ts. 3. Define and export NetworkNode (extending d3.SimulationNodeDatum) and NetworkLink. 4. Append comprehensive TSDoc comments (Semantic Primacy) explaining the cluster enum and visual mapping]. Type: Task.
  [ID-1.1.2] [DOCUMENTATION/SYNC]: [1. Open context.md at root. 2. Document architectural rule: "All rendering must be done via Canvas 2D pure functions; UI components must be dumb"]. Type: Task.
  [ID-1.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.1. 2. Append > Files touched: package.json, types.ts, context.md. 3. Check corresponding REQ in global_backlog.md]. Type: Task.

- [x] Story 1.2: Physics Simulation Engine (Isolated Logic) | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- Story 1.1)
  > Files touched: frontend/src/graph/simulationFactory.ts, frontend/src/graph/simulationFactory.test.ts
  Business Requirement: Construct the D3 force simulation decoupled from any UI rendering.
  Story Context Radius: {"src/graph/simulationFactory.ts": [""], "src/graph/simulationFactory.test.ts": [""], "src/graph/types.ts": ["NetworkNode", "NetworkLink"], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  [ID-1.2.1] [TESTING/TDE]: [1. Arrange: Create mock nodes and links arrays. 2. Act: Invoke createSimulation(nodes, links) from simulationFactory.ts. 3. Assert: Verify the returned simulation object is defined, forces (charge, link, center) are attached, and node arrays have vx/vy after tick()]. Type: Task.
  [ID-1.2.2] [CORE/LOGIC]: [1. Create src/graph/simulationFactory.ts. 2. Implement createSimulation using d3.forceSimulation. 3. Attach d3.forceManyBody().strength(-300) (Charge), d3.forceLink().distance(50) (Links), and d3.forceCenter() (Gravity). Return the simulation object]. Type: Task.
  [ID-1.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.2. 2. Append > Files touched: simulationFactory.ts, simulationFactory.test.ts. 3. Update global_backlog.md]. Type: Task.

- [x] Story 1.3: Render Micro-Surgery (Links & Nodes Utilities) | [MoSCoW: MUST] | [Complexity: HARD] (<-- Story 1.2)
  > Files touched: frontend/src/graph/render/draw.test.ts, frontend/src/graph/render/drawLinks.ts, frontend/src/graph/render/drawNodes.ts
  Business Requirement: Fracture rendering logic into atomic pure functions enforcing the 25-line limit and achieving the 3D visual fidelity.
  Story Context Radius: {"src/graph/render/drawLinks.ts": [""], "src/graph/render/drawNodes.ts": [""], "src/graph/render/draw.test.ts": [""], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-1.3.1] [TESTING/TDE]: [1. Arrange: Mock CanvasRenderingContext2D with spies on beginPath, arc, createRadialGradient, lineTo. 2. Act: Call drawLinks and drawNodes with mock data. 3. Assert: Verify createRadialGradient is called with exact stop colors (Red/Blue/Green) mapping the node's cluster enum]. Type: Task.
  [ID-1.3.2] [CORE/LOGIC]: [1. Create drawLinks.ts. 2. Export pure function drawLinks(ctx, links). 3. Implement standard beginPath, moveTo, lineTo looping over links. Apply .strokeStyle = "rgba(200,200,200,0.3)" and stroke()]. Type: Task.
  [ID-1.3.3] [CORE/LOGIC]: [1. Create drawNodes.ts. 2. Export pure function drawNodes(ctx, nodes). 3. Loop over nodes. For each, use ctx.createRadialGradient offset to top-left to simulate 3D light. Map node.cluster to accurate hex colors. Use arc and fill()]. Type: Task.
  [ID-1.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.3. 2. Append > Files touched: [files]. 3. Update global_backlog.md]. Type: Task.

- [x] Story 1.4: Render Micro-Surgery (Labels & Orchestrator) | [MoSCoW: MUST] | [Complexity: MEDIUM] (<-- Story 1.3)
  > Files touched: frontend/src/graph/render/drawLabels.ts, frontend/src/graph/render/renderLoop.ts, frontend/src/graph/render/renderLoop.test.ts
  Business Requirement: Handle typography layout and unify the render sequence into a single orchestrator function.
  Story Context Radius: {"src/graph/render/drawLabels.ts": [""], "src/graph/render/renderLoop.ts": [""], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  [ID-1.4.1] [TESTING/TDE]: [1. Arrange: Mock canvas context and drawLinks/drawNodes spies. 2. Act: Call executeRenderFrame(ctx, width, height, nodes, links). 3. Assert: Verify context is cleared (clearRect), then drawLinks, drawNodes, drawLabels are called sequentially]. Type: Task.
  [ID-1.4.2] [CORE/LOGIC]: [1. Create drawLabels.ts. 2. Export drawLabels(ctx, nodes). 3. Loop over nodes, set ctx.fillStyle to dark navy, ctx.font = "10px sans-serif", and execute fillText(node.name) offset from the node's origin based on its radius]. Type: Task.
  [ID-1.4.3] [CORE/LOGIC]: [1. Create renderLoop.ts. 2. Export executeRenderFrame(ctx, width, height, nodes, links). 3. Implement strict sequence: ctx.clearRect, drawLinks(ctx, links), drawNodes(ctx, nodes), drawLabels(ctx, nodes)]. Type: Task.
  [ID-1.4.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.4. 2. Append > Files touched: [files]. 3. Update global_backlog.md]. Type: Task.

- [x] Story 1.5: State Fractality (React Hook vs Dumb Canvas) | [MoSCoW: MUST] | [Complexity: HARD] (<-- Story 1.4)
  > Files touched: frontend/src/graph/dummyData.ts, frontend/src/graph/hooks/useForceSimulation.ts, frontend/src/graph/GraphCanvas.tsx
  Business Requirement: Connect the headless simulation to React lifecycle WITHOUT mutating the DOM directly, utilizing strict State/View separation.
  Story Context Radius: {"src/graph/hooks/useForceSimulation.ts": [""], "src/graph/GraphCanvas.tsx": [""], "src/graph/dummyData.ts": [""], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-1.5.1] [UI/MOCK]: [1. Create src/graph/dummyData.ts exporting static arrays dummyNodes and dummyLinks adhering to NetworkNode interfaces to fuel the development render]. Type: Task.
  [ID-1.5.2] [UI/LOGIC]: [1. Create useForceSimulation.ts. 2. Implement custom hook receiving data and a Canvas Ref. 3. Inside useEffect, invoke createSimulation. 4. Bind simulation.on("tick") to extract the Canvas context from the Ref and call executeRenderFrame. 5. Ensure cleanup logic simulation.stop() on unmount]. Type: Task.
  [ID-1.5.3] [UI/COMPONENT]: [1. Create GraphCanvas.tsx. 2. Implement a 100% dumb view: instantiate <canvas ref={canvasRef} />. 3. Call useForceSimulation({ nodes: dummyNodes, links: dummyLinks }, canvasRef). No logic rendering allowed in JSX]. Type: Task.
  [ID-1.5.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.5. 2. Append > Files touched: [files]. 3. Update global_backlog.md]. Type: Task.

- [ ] Story 1.6: Boundary Layer UI (Branding Overlay) | [MoSCoW: MUST] | [Complexity: EASY] (<-- Story 1.5)
  Business Requirement: Position the static "NOVASCOPE" branding overlay over the canvas layer without interfering with the physics.
  Story Context Radius: {"src/graph/GraphWrapper.tsx": [""], "leai_docs/planning/roadmap_1_novascope_d3.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-1.6.1] [UI/COMPONENT]: [1. Create GraphWrapper.tsx. 2. Render GraphCanvas as a child. 3. Inject a <div style={{ position: "absolute", bottom: "20px", right: "20px" }}> containing the text/logo "NOVASCOPE". 4. Ensure wrapper has position: "relative" to anchor the absolute overlay]. Type: Task.
  [ID-1.6.2] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_1_novascope_d3.md and check - [x] for Story 1.6. 2. Append > Files touched: [files]. 3. Update global_backlog.md]. Type: Task.