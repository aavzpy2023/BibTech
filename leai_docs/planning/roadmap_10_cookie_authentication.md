---
type: "roadmap"
epic_name: "Cookie Authentication Passthrough"
domain: "API & Resolution Engine"
complexity_aggregate: "MEDIUM"
---

# EPIC 11: COOKIE AUTHENTICATION PASSTHROUGH | [ISOLATED VERTICAL]

- [x] Story 10.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies.
Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
Layered Technical Breakdown:
[ID-10.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 11, its [REQ-029] to [REQ-031] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response (INCLUDING the YAML Frontmatter block above) into leai_docs/planning/roadmap_10_cookie_authentication.md]. Type: Task.

- [x] Story 10.1: Frontend UI State Fractality (Custom Hook) | [MoSCoW: MUST] | [Complexity: EASY]
Business Requirement: Expand the Batch Load configuration state strictly within the custom hook without touching the UI. (<-- REQ-029)
Story Context Radius: {"frontend/src/hooks/useBatchLoad.js": [""], "frontend/src/hooks/useBatchLoad.test.js": [""], "leai_docs/planning/roadmap_10_cookie_authentication.md": [""], "leai_docs/planning/global_backlog.md": [""]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-10.1.1] [TESTING/TDE]: [1. Arrange: Render useBatchLoad hook. 2. Act: Call updateConfig('cookies', 'session_id=123'). 3. Assert: Verify result.current.config.cookies matches the injected string]. Type: Task.
[ID-10.1.2] [UI/STATE]: [1. Open frontend/src/hooks/useBatchLoad.js. 2. Add cookies: '' to initialConfigState. 3. In startBatch, include cookies: activeConfig.cookies ?? '' in the JSON body payload of the fetch call]. Type: Task.
[ID-10.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_10_cookie_authentication.md and check - [x] for Story 10.1. 2. Append > Files touched: frontend/src/hooks/useBatchLoad.js, frontend/src/hooks/useBatchLoad.test.js under the story]. Type: Task.
> Files touched: frontend/src/hooks/useBatchLoad.js, frontend/src/hooks/useBatchLoad.test.js

- [x] Story 10.2: Frontend UI Dumb View & Wiring | [MoSCoW: MUST] | [Complexity: EASY]
Business Requirement: Implement the purely presentational input field for session cookies. (<-- REQ-029)
Story Context Radius: {"frontend/src/components/load/BatchConfig.jsx": [""], "frontend/src/components/load/BatchComponents.test.jsx": [""], "frontend/src/hooks/useBatchLoad.js": ["const initialConfigState"], "leai_docs/planning/roadmap_10_cookie_authentication.md": [""], "leai_docs/planning/global_backlog.md": [""]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-10.2.1] [TESTING/TDE]: [1. Arrange: Render BatchConfig with a mock onConfigUpdate. 2. Act: Type "token=abc" into the new Cookies input. 3. Assert: Verify onConfigUpdate is called with ('cookies', 'token=abc')]. Type: Task.
[ID-10.2.2] [UI/VIEW]: [1. Open frontend/src/components/load/BatchConfig.jsx. 2. Add cookies = '' to component signature defaults and extract currentCookies. 3. Add a new <div> inside styles.inputsGrid mimicking the Email section, with a label "Session Cookies (Optional)" and a text <input> wired to onConfigUpdate('cookies', e.target.value)]. Type: Task.
[ID-10.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_10_cookie_authentication.md and check - [x] for Story 10.2. 2. Append > Files touched: frontend/src/components/load/BatchConfig.jsx, frontend/src/components/load/BatchComponents.test.jsx under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-029]]. Type: Task.
> Files touched: frontend/src/components/load/BatchConfig.jsx, frontend/src/components/load/BatchComponents.test.jsx

- [x] Story 10.3: Backend Boundary Marshal (DTOs & Router) | [MoSCoW: MUST] | [Complexity: EASY]
Business Requirement: Force strictly primitive string payload boundaries for incoming cookies. (<-- REQ-030)
Story Context Radius: {"backend/src/bibliography/schemas.py": [""], "backend/src/bibliography/router.py": [""], "backend/tests/bibliography/test_schemas.py": [""], "backend/tests/bibliography/test_router.py": [""], "leai_docs/planning/roadmap_10_cookie_authentication.md": [""], "leai_docs/planning/global_backlog.md": [""]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-10.3.1] [TESTING/TDE]: [1. Arrange: Create valid dictionary payloads with a cookies key. 2. Act: Instantiate BatchDownloadRequest and LocalBatchDownloadRequest. 3. Assert: Verify Pydantic validation passes and exposes the .cookies string attribute]. Type: Task.
[ID-10.3.2] [EXTERNAL/DTO]: [1. Open backend/src/bibliography/schemas.py. 2. Add cookies: Optional[str] = Field(None, description="Optional raw session cookies to bypass 403 blocks.") to BatchDownloadRequest and LocalBatchDownloadRequest]. Type: Task.
[ID-10.3.3] [EXTERNAL/IO]: [1. Open backend/src/bibliography/router.py. 2. In batch_download, pass request.cookies as the 5th argument to execute_batch_download. 3. In batch_download_local, pass request.cookies as the 5th argument to execute_batch_download]. Type: Task.
[ID-10.3.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_10_cookie_authentication.md and check - [x] for Story 10.3. 2. Append > Files touched: backend/src/bibliography/schemas.py, backend/src/bibliography/router.py, backend/tests/bibliography/test_schemas.py, backend/tests/bibliography/test_router.py under the story]. Type: Task.
> Files touched: backend/src/bibliography/schemas.py, backend/src/bibliography/router.py, backend/tests/bibliography/test_schemas.py, backend/tests/bibliography/test_router.py

- [x] Story 10.4: Core Resolver & Downloader (Micro-Surgery & OCP) | [MoSCoW: MUST] | [Complexity: MEDIUM]
Business Requirement: Atomically inject cookies into the httpx.AsyncClient execution blocks without modifying core logical flows. (<-- REQ-030)
Story Context Radius: {"backend/src/bibliography/resolver_service.py": [""], "backend/src/bibliography/download_service.py": [""], "backend/tests/bibliography/test_resolver.py": [""], "backend/tests/bibliography/test_download.py": [""], "leai_docs/planning/roadmap_10_cookie_authentication.md": [""], "leai_docs/planning/global_backlog.md": [""]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-10.4.1] [TESTING/TDE]: [1. Arrange: Mock httpx.AsyncClient.get in test_download.py. 2. Act: Execute _download_and_save(..., cookies="auth=123"). 3. Assert: Verify client.get was invoked with cookies={'auth': '123'} and the _BROWSER_HEADERS]. Type: Task.
[ID-10.4.2] [CORE/LOGIC]: [1. Open backend/src/bibliography/resolver_service.py. 2. Add cookies: Optional[str] = None to resolve_pdf_url and resolve_institutional_pdf_url. 3. In resolve_institutional_pdf_url, if cookies is a string, parse it (parsed_cookies = dict(x.split('=') for x in cookies.split('; '))). 4. Pass cookies=parsed_cookies and headers=_BROWSER_HEADERS to client.get()]. Type: Task.
[ID-10.4.3] [CORE/LOGIC]: [1. Open backend/src/bibliography/download_service.py. 2. Add cookies: Optional[str] = None to execute_batch_download and pass it down. 3. In _download_and_save, import _BROWSER_HEADERS from .resolver_service, add cookies: Optional[str] = None to signature, parse it, and execute client.get(url, headers=_BROWSER_HEADERS, cookies=parsed_cookies)]. Type: Task.
[ID-10.4.4] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_10_cookie_authentication.md and check - [x] for Story 10.4. 2. Append > Files touched: backend/src/bibliography/resolver_service.py, backend/src/bibliography/download_service.py, backend/tests/bibliography/test_resolver.py, backend/tests/bibliography/test_download.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-030]]. Type: Task.
> Files touched: backend/src/bibliography/resolver_service.py, backend/src/bibliography/download_service.py, backend/tests/bibliography/test_resolver.py, backend/tests/bibliography/test_download.py

- [x] Story 10.5: CLI Argument Cookie Support (Script OCP) | [MoSCoW: MUST] | [Complexity: EASY]
Business Requirement: Extend the standalone batch script to consume cookies without breaking its standalone paradigm. (<-- REQ-031)
Story Context Radius: {"batch_downloader.py": [""], "leai_docs/planning/roadmap_10_cookie_authentication.md": [""], "leai_docs/planning/global_backlog.md": ["*"]}
Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
[ID-10.5.1] [TESTING/TDE]: [1. Arrange: Mock urllib.request.urlopen. 2. Act: Call the internal fetch wrapper in batch_downloader.py providing a cookie argument. 3. Assert: Verify the Request object contains the Cookie header alongside standard User-Agent headers]. Type: Task.
[ID-10.5.2] [CORE/IO]: [1. Open batch_downloader.py. 2. Append parser.add_argument('--cookies', type=str, default='', help='Raw session cookies string') to the argparse configuration. 3. Ensure the urllib.request.Request instantiation injects {'User-Agent': 'Mozilla/5.0...'}. 4. If args.cookies is truthy, append req.add_header('Cookie', args.cookies) before urlopen]. Type: Task.
[ID-10.5.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_10_cookie_authentication.md and check - [x] for Story 10.5. 2. Append > Files touched: batch_downloader.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-031]]. Type: Task.
> Files touched: batch_downloader.py