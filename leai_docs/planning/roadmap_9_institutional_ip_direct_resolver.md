---
type: "roadmap"
epic_name: "Institutional IP Direct Resolver"
domain: "Backend / PDF Resolution"
complexity_aggregate: "MEDIUM"
---

# EPIC 10: INSTITUTIONAL IP DIRECT RESOLVER | [ISOLATED VERTICAL]

- [x] Story 9.0: Roadmap & Planning Initialization | [MoSCoW: MUST] | [Complexity: TRIVIAL]
  Business Requirement: Initialize sequential agentic memory state trackers ensuring DAG dependencies for institutional IP resolution.
  Story Context Radius: {"leai_docs/planning/global_backlog.md": ["*"]}
  Layered Technical Breakdown:
  [ID-9.0.1] [PLANNING/INIT]: [1. Create leai_docs/planning/ directory if missing. 2. Append EPIC 10, its [REQ-027] and [REQ-028] list, and the Roadmap link to leai_docs/planning/global_backlog.md. 3. Write THIS ENTIRE raw markdown response into leai_docs/planning/roadmap_9_institutional_ip_direct_resolver.md]. Type: Task.

- [x] Story 9.1: Institutional Direct PDF Extractor (Landing Page Metadata) | [MoSCoW: MUST] | [Complexity: MEDIUM]
  Business Requirement: Follow DOI redirects to publisher landing pages and extract meta citation_pdf_url or standard PDF link headers using institutional IP privileges. (<-- REQ-027)
  Story Context Radius: {"backend/src/bibliography/resolver_service.py": ["def resolve_pdf_url"], "backend/tests/bibliography/test_resolver.py": ["*"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-9.1.1] [TESTING/TDE]: [1. Arrange: Mock httpx responses for doi.org redirect and publisher HTML containing meta name="citation_pdf_url" and link rel="alternate" application/pdf. 2. Act: Call resolve_institutional_pdf_url(doi). 3. Assert: Verify extracted PDF URL is returned properly]. Type: Task.
  [ID-9.1.2] [CORE/LOGIC]: [1. In resolver_service.py, implement async def resolve_institutional_pdf_url(doi: str, client: Optional[httpx.AsyncClient] = None) -> Optional[str]. 2. Send GET request to https://doi.org/{doi} with realistic browser User-Agent headers, following redirects. 3. Parse HTML looking for citation_pdf_url meta tag or Dublin Core identifiers. 4. Return extracted URL or None]. Type: Task.
  [ID-9.1.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_9_institutional_ip_direct_resolver.md and check - [x] for Story 9.1. 2. Append > Files touched: backend/src/bibliography/resolver_service.py, backend/tests/bibliography/test_resolver.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-027]]. Type: Task.
  > Files touched: backend/src/bibliography/resolver_service.py, backend/tests/bibliography/test_resolver.py

- [x] Story 9.2: Cascading Resolver Chain Integration | [MoSCoW: MUST] | [Complexity: EASY]
  Business Requirement: Wire institutional resolution into the fallback chain: Unpaywall -> OpenAlex -> Institutional IP Direct. (<-- REQ-028)
  Story Context Radius: {"backend/src/bibliography/resolver_service.py": ["def resolve_pdf_url"], "backend/tests/bibliography/test_resolver.py": ["*"]}
  Layered Technical Breakdown (FLASH-COMPATIBLE ALGORITHMS):
  [ID-9.2.1] [TESTING/TDE]: [1. Arrange: Mock Unpaywall and OpenAlex returning None, and mock resolve_institutional_pdf_url returning a valid PDF URL. 2. Act: Call resolve_pdf_url(doi, email). 3. Assert: Verify fallback chain reaches institutional resolver and returns URL]. Type: Task.
  [ID-9.2.2] [CORE/WIRING]: [1. In resolve_pdf_url, if both Unpaywall and OpenAlex yield no URL, call await resolve_institutional_pdf_url(doi). 2. Return result]. Type: Task.
  [ID-9.2.3] [PLANNING/SYNC]: [1. Open leai_docs/planning/roadmap_9_institutional_ip_direct_resolver.md and check - [x] for Story 9.2. 2. Append > Files touched: backend/src/bibliography/resolver_service.py, backend/tests/bibliography/test_resolver.py under the story. 3. Open leai_docs/planning/global_backlog.md and check - [x] for [REQ-028]]. Type: Task.
  > Files touched: backend/src/bibliography/resolver_service.py, backend/tests/bibliography/test_resolver.py