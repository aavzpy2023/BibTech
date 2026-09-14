import os


def discover_modules(backend_dir="backend/src", frontend_dir="frontend-react/src"):
    """Descubre dinámicamente los módulos de dominio ignorando capas técnicas."""
    ignore_dirs = {"core", "infrastructure", "shared", "config", "users", "auth"}
    modules = {}

    def scan_dir(base_dir):
        if not os.path.exists(base_dir): return
        for item in os.listdir(base_dir):
            path = os.path.join(base_dir, item)
            if os.path.isdir(path) and item not in ignore_dirs and not item.startswith(
                ("_", ".")):
                name = item.capitalize()
                if name not in modules:
                    modules[name] = []
                modules[name].append(path)

    scan_dir(backend_dir)
    scan_dir(frontend_dir)
    return modules


def apply_selection_logic(file_list, selection):
    """Filtra la lista de archivos basándose en la selección del usuario."""
    if selection in ['module', 'custom', '4']:
        return file_list

    filtered_list = []
    frontend_dir = os.path.normpath("frontend-react")
    backend_dir = os.path.normpath("backend")

    print(f"\nAplicando lógica de selección global: Opción {selection}...")

    for file_path in file_list:
        norm_path = os.path.normpath(file_path)

        if selection == '1':  # Backend Only
            if norm_path.startswith(frontend_dir):
                continue
            filtered_list.append(file_path)

        elif selection == '2':  # Frontend Only (con contexto Backend)
            if norm_path.startswith(frontend_dir):
                filtered_list.append(file_path)
                continue

            if not norm_path.startswith(backend_dir):
                filtered_list.append(file_path)
                continue

            # Contexto Backend necesario para Frontend
            is_domain = "domain" in norm_path and "entities" in norm_path
            is_api = "infrastructure" in norm_path and "driving" in norm_path and "api" in norm_path
            is_dto = "application" in norm_path and "dtos.py" in norm_path

            if is_domain or is_api or is_dto:
                filtered_list.append(file_path)
            else:
                continue
        else:
            filtered_list.append(file_path)

    return filtered_list


def force_find_files(target_list, excludes=None):
    """Validates physical existence and bypasses global logic for explicit lists."""
    if isinstance(target_list, dict):
        target_list = list(target_list.keys())
        
    print(f"\n[EXTRACTION] By-passing scan. Target files specified.")
    found =[]
    has_dir = False
    for f in target_list:
        if not os.path.exists(f): continue
        if os.path.isfile(f):
            found.append(f)
        elif os.path.isdir(f):
            has_dir = True
            for root, _, files in os.walk(f):
                found.extend([os.path.join(root, file) for file in files])

    if excludes and has_dir:
        found = filter_excluded_paths(found, excludes)

    return found

def find_project_files(base_directories, extensions_to_include):
    try:
        from _scripts.dev.config import EXACT_FILES_TO_INCLUDE, TREE_DIRS_TO_EXCLUDE, PATHS_TO_EXCLUDE
    except ImportError:
        try:
            from config import EXACT_FILES_TO_INCLUDE, TREE_DIRS_TO_EXCLUDE, PATHS_TO_EXCLUDE
        except ImportError:
            EXACT_FILES_TO_INCLUDE = [
                "Makefile", "Dockerfile", "docker-compose.yml", "docker-compose.yaml"
            ]
            TREE_DIRS_TO_EXCLUDE = [".git", "__pycache__", "node_modules", ".venv"]
            PATHS_TO_EXCLUDE = []
        
    global_excludes = set()
    path_excludes = set()
    for p in list(TREE_DIRS_TO_EXCLUDE) + list(PATHS_TO_EXCLUDE):
        p_clean = p.rstrip('/\\')
        if not p_clean: continue
        if os.sep in p_clean or '/' in p_clean or '\\' in p_clean:
            path_excludes.add(os.path.normpath(p_clean))
        else:
            global_excludes.add(p_clean)

    found_files = []
    print(f"\nBuscando archivos en: {base_directories}")

    for base_dir in base_directories:
        if not os.path.exists(base_dir):
            print(f"  [ADVERTENCIA] Ruta no encontrada: {base_dir}")
            continue

        if os.path.isfile(base_dir):
            found_files.append(base_dir)
            continue

        for root, dirs, files in os.walk(base_dir, topdown=True):
            new_dirs = []
            for d in dirs:
                if d in global_excludes:
                    continue
                dir_path = os.path.normpath(os.path.join(root, d))
                try:
                    rel_to_cwd = os.path.relpath(dir_path, '.')
                except Exception:
                    rel_to_cwd = dir_path
                
                is_excluded = False
                for p_ext in path_excludes:
                    if rel_to_cwd == p_ext or rel_to_cwd.startswith(p_ext + os.sep):
                        is_excluded = True
                        break
                if not is_excluded:
                    new_dirs.append(d)
            dirs[:] = new_dirs

            for file in files:
                if file.endswith(tuple(extensions_to_include)) or file in EXACT_FILES_TO_INCLUDE:
                    found_files.append(os.path.join(root, file))

    print(f"Se encontraron {len(found_files)} archivos candidatos.")
    return sorted(found_files)


def filter_excluded_paths(file_list, exclusion_list):
    global_excludes = set()
    path_excludes = set()

    # Clasificamos exclusiones en globales (nombres sueltos) o específicas (rutas relativas)
    for p in exclusion_list:
        p_clean = p.rstrip('/\\')
        if not p_clean: continue
        if os.sep in p_clean or '/' in p_clean or '\\' in p_clean:
            path_excludes.add(os.path.normpath(p_clean))
        else:
            global_excludes.add(p_clean)

    filtered_list = []
    for file_path in file_list:
        normalized_file_path = os.path.normpath(file_path)
        base_name = os.path.basename(normalized_file_path)

        # [Auto-Exclusión]: Prevenir bucles infinitos
        if base_name.startswith("SKARCH_") or base_name.startswith("SKDEV_"):
            continue

        # 1. Chequeo de carpetas/nombres globales prohibidos (ej: build, __pycache__)
        path_parts = normalized_file_path.split(os.sep)
        if any(part in global_excludes for part in path_parts):
            continue

        # 2. Chequeo de prefijos exactos para rutas relativas especificas
        is_excluded = False
        for p_ext in path_excludes:
            if normalized_file_path == p_ext or normalized_file_path.startswith(p_ext + os.sep):
                is_excluded = True
                break

        if not is_excluded:
            filtered_list.append(file_path)

    return filtered_list
