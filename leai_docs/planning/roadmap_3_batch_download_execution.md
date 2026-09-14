---
type: "roadmap"
epic_name: "Batch Download Execution"
domain: "Bibliography / Real-time I/O"
complexity_aggregate: "HARD"
---

# Roadmap 3: Batch Download Execution

## EPIC 4: BATCH DOWNLOAD EXECUTION | [ISOLATED VERTICAL]

- [x] Story 3.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [x] [ID-3.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/roadmap_3_batch_download_execution.md. 2. Append EPIC 4, its [REQ-008] to [REQ-011] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_3_batch_download_execution.md]. Type: Task.

- [x] Story 3.1: Frontend UI Fractality &amp; Validation Lockdown | [MoSCoW: MUST] | [Complexity: EASY]
  &gt; Files touched: BatchConfig.jsx, BatchMonitor.jsx, LoadView.jsx, BatchComponents.test.jsx, BatchMonitor.test.jsx
  Business Requirement: Strip unused view elements and enforce state-driven validation on the execution button. (&lt;-- REQ-008)
  Story Context Radius: {"frontend/src/components/load/BatchConfig.jsx": [""], "frontend/src/components/load/BatchMonitor.jsx": [""], "frontend/src/views/LoadView.jsx": [""], "frontend/src/components/load/BatchComponents.test.jsx": [""], "frontend/src/components/load/BatchMonitor.test.jsx": [""], "leai_docs/planning/roadmap_3_batch_download_execution.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-3.1.1] [TESTING/TDE]: [1. Arrange: Render BatchMonitor with disabled={true}. 2. Act: Attempt to fire the Start button click event. 3. Assert: Verify the onStart callback is NOT invoked and the button element has the disabled attribute]. Type: Task.
  - [ID-3.1.2] [UI/VIEW]: [1. Open frontend/src/components/load/BatchConfig.jsx. 2. Surgically remove the AVAILABLE_SOURCES array and the entire div containing the source checkboxes. 3. Remove sources from the component signature and state interactions]. Type: Task.
  - [ID-3.1.3] [UI/VIEW]: [1. Open frontend/src/components/load/BatchMonitor.jsx. 2. Inject disabled boolean into props. 3. Apply disabled={disabled} to the &lt;button&gt; and dynamically adjust background color to #94d3a2 when disabled]. Type: Task.
  - [ID-3.1.4] [UI/STATE_WIRING]: [1. Open frontend/src/views/LoadView.jsx. 2. Compute primitive boolean: const isValid = input.dois.trim() !== '' &amp;&amp; config.destination.trim() !== '' &amp;&amp; config.email.trim() !== '';. 3. Pass disabled={!isValid} down to &lt;BatchMonitor /&gt;]. Type: Task.
  - [ID-3.1.5] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_3_batch_download_execution.md and check - [x] for Story 3.1. 2. Append &gt; Files touched: BatchConfig.jsx, BatchMonitor.jsx, LoadView.jsx, BatchComponents.test.jsx, BatchMonitor.test.jsx. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-008]]. Type: Task.

- [x] Story 3.2: PDF Resolver Generic Service (Unpaywall/OpenAlex) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  &gt; Files touched: resolver_service.py, test_resolver.py
  Business Requirement: Implement HTTPX logic to sequentially query external APIs, returning raw PDF URLs. (&lt;-- REQ-009)
  Story Context Radius: {"backend/src/bibliography/resolver_service.py": [""], "backend/tests/bibliography/test_resolver.py": [""], "leai_docs/planning/roadmap_3_batch_download_execution.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-3.2.1] [TESTING/TDE]: [1. Arrange: Patch httpx.AsyncClient.get to mock a successful Unpaywall JSON response (is_oa: true, best_oa_location.url_for_pdf: "http://pdf"). 2. Act: Await resolve_pdf_url("10.mock", "e@mail.com"). 3. Assert: Verify the function returns exactly "http://pdf"]. Type: Task.
  - [ID-3.2.2] [CORE/LOGIC]: [1. Create backend/src/bibliography/resolver_service.py. 2. Implement async resolve_pdf_url(doi: str, email: str) -&gt; str | None. 3. Try Unpaywall GET /v2/{doi}?email={email}. Return best_oa_location.url_for_pdf if valid. 4. If Unpaywall fails, catch exception and try OpenAlex GET /works/doi:{doi}. Return open_access.oa_url if valid. 5. Return None if both fail. (Keep under 25 lines)]. Type: Task.
  - [ID-3.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_3_batch_download_execution.md and check - [x] for Story 3.2. 2. Append &gt; Files touched: resolver_service.py, test_resolver.py. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-009]]. Type: Task.

- [x] Story 3.3: Micro-fractal IO &amp; Async Batch Orchestrator | [MoSCoW: MUST] | [Complexity: HARD]
  &gt; Files touched: file_storage_service.py, download_service.py, test_download.py
  Business Requirement: Separate File I/O from the execution generator to ensure code atomic limits and stream live events. (&lt;-- REQ-010)
  Story Context Radius: {"backend/src/bibliography/resolver_service.py": [""], "backend/src/bibliography/file_storage_service.py": [""], "backend/src/bibliography/download_service.py": [""], "backend/tests/bibliography/test_download.py": [""], "leai_docs/planning/roadmap_3_batch_download_execution.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-3.3.1] [TESTING/TDE]: [1. Arrange: Mock resolve_pdf_url (returns URL), mock httpx.AsyncClient.get (returns bytes), and mock aiofiles.open / standard open. 2. Act: Consume the async generator execute_batch_download(["10.x"], "dest", "e", 0). 3. Assert: Verify the generator yields JSON payload strings correctly incrementing progress and logging states]. Type: Task.
  - [ID-3.3.2] [CORE/IO]: [1. Create backend/src/bibliography/file_storage_service.py. 2. Implement async save_pdf_bytes(destination_path: str, doi: str, pdf_bytes: bytes) -&gt; str. 3. Sanitize DOI to create a valid filename. Write bytes to destination_path/filename.pdf (ensure folder exists via pathlib). Return absolute saved path]. Type: Task.
  - [ID-3.3.3] [CORE/LOGIC]: [1. Create backend/src/bibliography/download_service.py. 2. Implement async generator execute_batch_download(dois: list[str], dest: str, email: str, delay: int). 3. Loop over DOIs. Yield JSON parsing state. Await resolve_pdf_url. 4. If URL exists, fetch raw bytes via HTTPX, await save_pdf_bytes. 5. Yield success JSON string. 6. Await asyncio.sleep(delay). 7. Yield final completion event]. Type: Task.
  - [ID-3.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_3_batch_download_execution.md and check - [x] for Story 3.3. 2. Append &gt; Files touched: file_storage_service.py, download_service.py, test_download.py. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-010]]. Type: Task.

- [ ] Story 3.4: Boundary Marshal API Endpoint (SSE) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Define strict DTOs and expose the generator stream safely to the frontend. (&lt;-- REQ-010)
  Story Context Radius: {"backend/src/bibliography/schemas.py": [""], "backend/src/bibliography/router.py": [""], "backend/src/bibliography/download_service.py": ["def execute_batch_download"], "backend/tests/bibliography/test_router.py": [""], "leai_docs/planning/roadmap_3_batch_download_execution.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ID-3.4.1] [TESTING/TDE]: [1. Arrange: Mock execute_batch_download to yield {"log": "test"}. 2. Act: Send POST to /api/bibliography/batch-download with valid JSON payload using TestClient. 3. Assert: Verify response status is 200, content-type is text/event-stream, and content matches data: {"log": "test"}\n\n]. Type: Task.
  - [ID-3.4.2] [EXTERNAL/DTO]: [1. Open backend/src/bibliography/schemas.py. 2. Define BatchDownloadRequest extending BaseModel. 3. Strictly require dois: list[str], delay: int, destination: str, email: str. Inject English semantic metadata via Field(description="...")]. Type: Task.
  - [ID-3.4.3] [EXTERNAL/IO]: [1. Open backend/src/bibliography/router.py. 2. Add POST /batch-download accepting BatchDownloadRequest. 3. Return StreamingResponse(sse_generator(), media_type="text/event-stream"). 4. The internal sse_generator must consume execute_batch_download and format every string as yield f"data: {event_string}\n\n"]. Type: Task.
  - [ID-3.4.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_3_batch_download_execution.md and check - [x] for Story 3.4. 2. Append &gt; Files touched: schemas.py, router.py, test_router.py. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-010]]. Type: Task.

- [ ] Story 3.5: Frontend SSE Hook State Integration | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Read the text/event-stream in React, dynamically mutating the monitor state without blocking the UI thread. (&lt;-- REQ-011)
  Story Context Radius: {"frontend/src/hooks/useBatchLoad.js": [""], "frontend/src/hooks/useBatchLoad.test.js": [""], "leai_docs/planning/roadmap_3_batch_download_execution.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ID-3.5.1] [TESTING/TDE]: [1. Arrange: Mock window.fetch to return a ReadableStream resolving to data: {"log": "test", "progress": 1}\n\n. 2. Act: Render useBatchLoad and call startBatch(). 3. Assert: Verify monitor.logs contains "test" and monitor.progress is 1]. Type: Task.
  - [ID-3.5.2] [UI/STATE]: [1. Open frontend/src/hooks/useBatchLoad.js. 2. Rewrite startBatch. Extract DOIs by splitting input.dois on \n (filter empty). Reset monitor to {progress: 0, total: dois.length, logs: []}. 3. Execute fetch('/api/bibliography/batch-download', { method: 'POST', body: JSON.stringify({...}) }). 4. Await response.body.getReader(). 5. while(true) read the chunks, decode using TextDecoder, parse the JSON inside data: {...}, and call setMonitor mapping the updates incrementally. Handle stream closing]. Type: Task.
  - [ID-3.5.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_3_batch_download_execution.md and check - [x] for Story 3.5. 2. Append &gt; Files touched: useBatchLoad.js, useBatchLoad.test.js. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-011]]. Type: Task.