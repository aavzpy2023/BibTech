---
type: "roadmap"
epic_name: "Download Queue & ZIP Export"
domain: "Frontend UI & Backend I/O"
complexity_aggregate: "HARD"
---

# EPIC 5: DOWNLOAD QUEUE & ZIP EXPORT | [ISOLATED VERTICAL]

- [x] Story 4.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [x] [ID-4.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/roadmap_4_download_queue_and_zip.md. 2. Append EPIC 5, its [REQ-012] to [REQ-014] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_4_download_queue_and_zip.md]. Type: Task.
  > Files touched: leai_docs/planning/roadmap_4_download_queue_and_zip.md, leai_docs/planning/global_backlog.md

- [ ] Story 4.1: Load View Validation & Label Updates | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Enforce email format validation before allowing execution and update UI labels. (<-- REQ-012)
  Story Context Radius: {"frontend/src/hooks/useBatchLoad.js": [""], "frontend/src/components/load/BatchConfig.jsx": [""], "frontend/src/views/LoadView.jsx": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ ] [ID-4.1.1] [TESTING/TDE]: [1. Arrange: Render useBatchLoad hook. 2. Act: Update config with invalid email, then valid email. 3. Assert: Verify a computed isValidEmail boolean reflects the regex state correctly]. Type: Task.
  - [ ] [ID-4.1.2] [UI/STATE]: [1. Open frontend/src/hooks/useBatchLoad.js. 2. Add a computed boolean isValidEmail using regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ against config.email. 3. Export isValidEmail]. Type: Task.
  - [ ] [ID-4.1.3] [UI/VIEW]: [1. Open frontend/src/components/load/BatchConfig.jsx. 2. Change the label text from "Destination Folder" to "Batch name". 3. Change the input placeholder to "Batch name"]. Type: Task.
  - [ ] [ID-4.1.4] [UI/WIRING]: [1. Open frontend/src/views/LoadView.jsx. 2. Extract isValidEmail from useBatchLoad. 3. Update the isValid boolean to require isValidEmail === true]. Type: Task.
  - [ ] [ID-4.1.5] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.1. 2. Append > Files touched: frontend/src/hooks/useBatchLoad.js, frontend/src/components/load/BatchConfig.jsx, frontend/src/views/LoadView.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-012]]. Type: Task.

- [x] Story 4.2: Queue View State & Routing (State Fractality) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Isolate Queue state logic into a custom hook and wire the router redirection. (<-- REQ-013)
  > Files touched: frontend/src/hooks/useQueueState.js, frontend/src/views/LoadView.jsx, frontend/src/App.jsx
  Story Context Radius: {"frontend/src/hooks/useQueueState.js": [""], "frontend/src/views/LoadView.jsx": [""], "frontend/src/App.jsx": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ ] [ID-4.2.1] [TESTING/TDE]: [1. Arrange: Mock react-router-dom useLocation to return { state: { dois: "10.1", config: { destination: "batch1" } } }. 2. Act: Render useQueueState. 3. Assert: Verify initial state extracts DOIs into an array and initializes selectedDois as empty]. Type: Task.
  - [ ] [ID-4.2.2] [UI/STATE]: [1. Create frontend/src/hooks/useQueueState.js. 2. Import useLocation. Extract dois and config from location.state. 3. Initialize selectedDois state array. 4. Implement toggleSelection(doi) and toggleAll(dois) functions. 5. Export state and functions]. Type: Task.
  - [ ] [ID-4.2.3] [UI/WIRING]: [1. Open frontend/src/views/LoadView.jsx. 2. Import useNavigate. 3. Replace startBatch call in onStart with navigate('/queue', { state: { dois: input.dois, config } })]. Type: Task.
  - [ ] [ID-4.2.4] [UI/WIRING]: [1. Open frontend/src/App.jsx. 2. Add <Route path="queue" element={<QueueView />} /> (create a temporary dummy QueueView.jsx returning a div if it doesn't exist yet)]. Type: Task.
  - [ ] [ID-4.2.5] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.2. 2. Append > Files touched: frontend/src/hooks/useQueueState.js, frontend/src/views/LoadView.jsx, frontend/src/App.jsx under the story]. Type: Task.

- [x] Story 4.3: Queue View UI & Assembly (Dumb View) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement a pure dumb component for the Queue table, wired to useQueueState. (<-- REQ-013)
  > Files touched: frontend/src/views/QueueView.jsx
  Story Context Radius: {"frontend/src/views/QueueView.jsx": [""], "frontend/src/hooks/useQueueState.js": [""], "frontend/src/hooks/useBatchLoad.js": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ ] [ID-4.3.1] [TESTING/TDE]: [1. Arrange: Mock useQueueState to return dummy DOIs and useBatchLoad to return dummy monitor logs. 2. Act: Render QueueView. 3. Assert: Verify table rows render correctly with checkboxes]. Type: Task.
  - [ ] [ID-4.3.2] [UI/VIEW]: [1. Open frontend/src/views/QueueView.jsx. 2. Import useQueueState and useBatchLoad. 3. Call startBatch in a useEffect on mount (using the config from useQueueState). 4. Render an HTML <table> mapping over the DOIs. 5. Render checkboxes wired to toggleSelection and selectedDois.includes(doi)]. Type: Task.
  - [ ] [ID-4.3.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.3. 2. Append > Files touched: frontend/src/views/QueueView.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-013]]. Type: Task.

- [x] Story 4.4: Backend ZIP Service (Micro-Surgery) | [MoSCoW: MUST] | [Complexity: HARD]
  Business Requirement: Create a pure, atomic service to compress requested PDFs into an in-memory ZIP file. (<-- REQ-014)
  > Files touched: backend/src/bibliography/zip_service.py, backend/tests/bibliography/test_zip_service.py
  Story Context Radius: {"backend/src/bibliography/zip_service.py": [""], "backend/tests/bibliography/test_zip_service.py": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ ] [ID-4.4.1] [TESTING/TDE]: [1. Arrange: Mock os.path.exists to return True and mock builtins.open to return dummy bytes. 2. Act: Call create_zip_from_pdfs("batch1", ["10.1/123"]). 3. Assert: Verify the returned BytesIO object is not empty and contains valid zip headers]. Type: Task.
  - [ ] [ID-4.4.2] [CORE/IO]: [1. Create backend/src/bibliography/zip_service.py. 2. Implement def create_zip_from_pdfs(batch_name: str, dois: list[str]) -> BytesIO:. 3. Initialize io.BytesIO(). 4. Use zipfile.ZipFile to write files. 5. Iterate DOIs, sanitize them to match saved filenames, check if file exists in batch_name folder, and write to zip. 6. Return the BytesIO object after seeking to 0. (Strict 25-line limit)]. Type: Task.
  - [ ] [ID-4.4.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.4. 2. Append > Files touched: backend/src/bibliography/zip_service.py, backend/tests/bibliography/test_zip_service.py under the story]. Type: Task.

- [x] Story 4.5: Backend ZIP Endpoint (Boundary Marshal & Semantic Primacy) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Expose the ZIP service via a FastAPI endpoint with strict, semantically documented DTOs. (<-- REQ-014)
  > Files touched: backend/src/bibliography/schemas.py, backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py
  Story Context Radius: {"backend/src/bibliography/schemas.py": [""], "backend/src/bibliography/router.py": [""], "backend/src/bibliography/zip_service.py": ["def create_zip_from_pdfs"], "backend/tests/bibliography/test_router.py": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  - [ ] [ID-4.5.1] [TESTING/TDE]: [1. Arrange: Mock create_zip_from_pdfs to return a dummy BytesIO. 2. Act: Send POST to /api/bibliography/download-zip with {"batch_name": "test", "dois": []}. 3. Assert: Verify status 200 and content-type is application/zip]. Type: Task.
  - [ ] [ID-4.5.2] [EXTERNAL/DTO]: [1. Open backend/src/bibliography/schemas.py. 2. Add class ZipDownloadRequest(BaseModel):. 3. Add batch_name: str = Field(..., description="The name of the batch folder containing the PDFs."). 4. Add dois: List[str] = Field(..., description="List of DOIs to include in the ZIP archive.")]. Type: Task.
  - [ ] [ID-4.5.3] [EXTERNAL/IO]: [1. Open backend/src/bibliography/router.py. 2. Add @router.post("/download-zip"). 3. Call create_zip_from_pdfs(request.batch_name, request.dois). 4. Return StreamingResponse(zip_io, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={request.batch_name}.zip"})]. Type: Task.
  - [ ] [ID-4.5.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.5. 2. Append > Files touched: backend/src/bibliography/schemas.py, backend/src/bibliography/router.py, backend/tests/bibliography/test_router.py under the story]. Type: Task.

- [ ] Story 4.6: Frontend ZIP Download Action (State Fractality) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Implement the Blob download logic in the state hook and wire it to a dumb button in the view. (<-- REQ-014)
  Story Context Radius: {"frontend/src/hooks/useQueueState.js": [""], "frontend/src/views/QueueView.jsx": [""], "leai_docs/planning/roadmap_4_download_queue_and_zip.md": [""], "leai_docs/planning/global_backlog.md": [""]}
  Layered Technical Breakdown:
  - [ ] [ID-4.6.1] [TESTING/TDE]: [1. Arrange: Mock window.fetch to return a Blob and mock URL.createObjectURL. 2. Act: Call downloadZip from useQueueState. 3. Assert: Verify fetch was called with the correct endpoint and payload]. Type: Task.
  - [ ] [ID-4.6.2] [UI/STATE]: [1. Open frontend/src/hooks/useQueueState.js. 2. Implement const downloadZip = async () => {}. 3. Fetch POST /api/bibliography/download-zip passing batch_name and selectedDois. 4. Convert response to await response.blob(). 5. Create object URL (URL.createObjectURL), append a hidden <a> tag, click it, and clean up the URL]. Type: Task.
  - [ ] [ID-4.6.3] [UI/VIEW]: [1. Open frontend/src/views/QueueView.jsx. 2. Add a button "Download PDFs". 3. Disable the button if selectedDois.length === 0. 4. Attach onClick={downloadZip} from the hook]. Type: Task.
  - [ ] [ID-4.6.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_4_download_queue_and_zip.md and check - [x] for Story 4.6. 2. Append > Files touched: frontend/src/hooks/useQueueState.js, frontend/src/views/QueueView.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-014]]. Type: Task.