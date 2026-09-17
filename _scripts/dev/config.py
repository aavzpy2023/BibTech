from dataclasses import dataclass
from typing import Optional

@dataclass
class ExportConfig:
    intent_name: str
    use_ast: bool
    use_line_numbers: bool
    content_file: str
    tree_file: str
    roadmap_text: Optional[str] = None
    active_roadmap_name: Optional[str] = None

# --- DIRECTORIO DE SALIDA ---
# Modifica este valor para guardar los archivos generados (SKDEV_*, SKARCH_*) en otra carpeta. Ej: "exports" o "data/output"
OUTPUT_DIR = "."

DEFAULT_DIRECTORIES_TO_SCAN = ["."]

GLOBAL_CONTEXT = [

]

SHARED_DIRECTORIES = [

]

GLOBAL_TESTS = [
    "tests"
]

MODULE_DEFINITIONS = {
    "Project context": ["skills/project_context.md"],
    "Tests": ["backend/tests", "pytest.ini"],
    "DB": ["backend/src/database/models/", "backend/alembic/versions"]
    
}

FILE_EXTENSIONS_TO_INCLUDE = [
    ".py", ".yml", ".sh", ".env", ".conf", ".txt", ".md", ".json", ".html",
    "Dockerfile", ".jsx", ".css", ".js", ".ts", ".tsx", ".ini",
]

EXACT_FILES_TO_INCLUDE = [
    "Makefile", "Dockerfile", "docker-compose.yml", "docker-compose.yaml"
]

TREE_DIRS_TO_EXCLUDE = [
    ".git", "__pycache__", "node_modules", ".venv", ".opencode", ".zed", ".pytest_cache", ".idea/", "backend/.ruff_cache"
]

PATHS_TO_EXCLUDE = [
    ".ruff_cache",
    ".git/",
    "__pycache__/",
    # "_scripts",
    ".venv/",
    "./.github/",
    ".zed/",
    "SKDEV_content.txt",
    "SKDEV_tree.txt",
    "SKDARCH_content.txt",
    "SKDARCH_tree.txt"
]

EXTRACTION_RULES = {
    ".py": ["def ", "class ", "import ", "from "],
    ".ts": ["function ", "class ", "const ", "import "],
    ".js": ["function ", "class ", "const ", "import "],
    ".tsx": ["function ", "class ", "const ", "import "],
    ".jsx": ["function ", "class ", "const ", "import "]
}

AST_COMPRESSION_BYPASS = [
    "container.py",
    "dependencies.py",
    "main.py",
    "app.py",
    "router.py",
    "routes.py",
    "store.ts",
    "App.tsx",
    "backend/migrations/env.py"
]

import os
import sys
import importlib.util

_target_conf = os.path.join(os.getcwd(), "_scripts", "dev", "config.py")
if os.path.exists(_target_conf) and _target_conf != os.path.abspath(__file__):
    _spec = importlib.util.spec_from_file_location(
        "target_config", _target_conf
    )
    if _spec and _spec.loader:
        _t_conf = importlib.util.module_from_spec(_spec)
        _spec.loader.exec_module(_t_conf)
        for _k in dir(_t_conf):
            if not _k.startswith("__"):
                new_val = getattr(_t_conf, _k)
                if (
                    _k in globals()
                    and isinstance(globals()[_k], list)
                    and isinstance(new_val, list)
                ):
                    globals()[_k].clear()
                    globals()[_k].extend(new_val)
                else:
                    globals()[_k] = new_val
