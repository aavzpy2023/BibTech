---
type: "roadmap"
epic_name: "Local File Batch Download"
domain: "Backend / API Boundary"
complexity_aggregate: "MEDIUM"
---

# EPIC 9: LOCAL FILE BATCH DOWNLOAD | [ISOLATED VERTICAL]

- [x] Story 8.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-8.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 9, its [REQ-025] and [REQ-026] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_8_local_file_batch_download.md]. Type: Task.

- [x] Story 8.1: Local File Batch Download Schema (Boundary Marshal) | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Define the strict DTO for the new local file batch download request, restricting payloads to primitives. (<-- REQ-025)
  > Files touched: backend/src/bibliography/schemas.py, backend/tests/bibliography/test_schemas.py
  Story Context Radius: {"backend/src/bibliography/schemas.py": ["class BatchDownloadRequest"], "leai_docs/planning/roadmap_8_local_file_batch_download.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-8.1.1] [TESTING/TDE]: [1. Arrange: Create valid and invalid payload dictionaries for the new local request. 2. Act: Instantiate LocalBatchDownloadRequest. 3. Assert: Verify defaults (delay=5) are applied and validation errors are raised for missing primitive fields]. Type: Task.
  [ID-8.1.2] [EXTERNAL/DTO]: [1. Open backend/src/bibliography/schemas.py. 2. Add class LocalBatchDownloadRequest(BaseModel). 3. Define strict primitive fields: file_path: str, destination: str, email: str, delay: int = 5. 4. Enforce Semantic Primacy by adding Field(..., description="...") in English to every attribute]. Type: Task.
  [ID-8.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_8_local_file_batch_download.md and check - [x] for Story 8.1. 2. Append > Files touched: backend/src/bibliography/schemas.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-025]]. Type: Task.

- [x] Story 8.2: Local File Batch Download Endpoint (Micro-Surgery & OCP) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement the SSE endpoint that reads a local file, extracts DOIs, and streams the download execution reusing existing orchestrators. (<-- REQ-026)
  > Files touched: backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py
  Story Context Radius: {"backend/src/bibliography/router.py": ["router", "def batch_download"], "backend/tests/bibliography/test_router.py": ["def test_batch_download_endpoint_direct"], "backend/src/bibliography/schemas.py": ["class LocalBatchDownloadRequest"], "backend/src/bibliography/download_service.py": ["def execute_batch_download"], "leai_docs/planning/roadmap_8_local_file_batch_download.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-8.2.1] [TESTING/TDE]: [1. Arrange: In backend/tests/bibliography/test_router.py, mock builtins.open to return dummy .bib content containing a DOI. Mock execute_batch_download to yield {"log": "test"}. 2. Act: Send POST to /api/bibliography/batch-download-local with a valid JSON payload using TestClient. 3. Assert: Verify response status is 200, content-type is text/event-stream, and content matches data: {"log": "test"}\n\n]. Type: Task.
  [ID-8.2.2] [EXTERNAL/IO]: [1. Open backend/src/bibliography/router.py. 2. Add @router.post("/batch-download-local") accepting request: LocalBatchDownloadRequest. 3. Inside the endpoint, use with open(request.file_path, 'r', encoding='utf-8') as f: to read the file content. 4. Extract DOIs using a robust regex (e.g., re.findall(r'\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b', content, re.I)). Deduplicate the list]. Type: Task.
  [ID-8.2.3] [CORE/WIRING]: [1. In the same endpoint, define async def sse_generator(): that iterates async for event in execute_batch_download(dois, request.destination, request.email, request.delay): and yields f"data: {event}\n\n". 2. Return StreamingResponse(sse_generator(), media_type="text/event-stream"). (Strict 25-line limit for the entire endpoint)]. Type: Task.
  [ID-8.2.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_8_local_file_batch_download.md and check - [x] for Story 8.2. 2. Append > Files touched: backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-026]]. Type: Task.