# System Context: bibtech

## 1. Architectural Foundation
- **Backend**: FastAPI 0.110.0 running on Python &gt;= 3.11 with Uvicorn.
- **Frontend**: React 18 (Vite SPA) enforcing clean dumb-component separation.
- **Proxy/Ingress**: Nginx reverse proxy routing `/api` traffic to backend.
- **Database**: PostgreSQL 16 (handled via psycopg2-binary / migrations).

## 2. Domain: Bibliography Ingestion &amp; Visualization
- **Core Responsibility**: Parsing bibliographic citation files (`.ris` and
  `.bib`) into normalized domain entities, served via API and displayed in an
  interactive tabular format.
- **Core Entities**:
  - `ParsedReference`: Author, Year, Title, Journal, and Upload Datetime.
- **Key Modules**:
  - `frontend/src/components/common/ModalTemplate.jsx`: Reusable base modal dumb view.
  - `frontend/src/hooks/useReferenceDetails.js`: Centralized hook enforcing State Fractality for modal views.
  - `frontend/src/components/references/ReferenceDetailsModal.jsx`: Assembler component wiring dumb views and state hook.
  - `backend/src/bibliography/parser_service.py`: Pure parsing core using
    `rispy` and `bibtexparser`. Zero I/O coupling.
  - `backend/src/bibliography/router.py`: FastAPI boundary exposing
    `POST /api/bibliography/upload`.
  - `frontend/src/hooks/useBibliography.js`: Isolated React state and async
    mutations.
  - `frontend/src/components/BibliographyUploader.jsx`: Pure view handling file
    drop via `react-dropzone`.
  - `frontend/src/components/ReferenceTable.jsx`: Pure tabular view formatting
    timestamps via `date-fns`.
  - `frontend/src/components/references/MetadataGrid.jsx` & `HoverPopover.jsx`:
    Dumb components enforcing State Fractality for metadata display.
  - `frontend/src/config/analysisMenuConfig.js` & `useAnalysisNavigation.js`:
    Static config and State hook isolating pure UI transitions for the Analysis shell.
  - `frontend/src/components/analysis/AnalysisPageTemplate.jsx`:
    Canonical layout template for all analytical views (Title, Subtitle, Toolbar, Main Canvas, Footer Drawer).