import os
import sys
from datetime import datetime

# --- CONFIGURACIÓN ---
# Directorios base por defecto para las opciones globales (1, 2 y 3).
DEFAULT_DIRECTORIES_TO_SCAN = [
    ".",

]

# --- SKELETON GLOBAL (Siempre incluido) ---
# Archivos estructurales necesarios para entender el proyecto base.
GLOBAL_CONTEXT = [
    # Backend Skeleton
    "backend/src/main.py",
    "backend/src/app.py",
    "backend/src/infrastructure",  # Global Adapters (DB Engine, Redis, Base Classes)
    "backend/src/config",  # Global Settings
    "backend/pyproject.toml",

    # Frontend Skeleton
    "frontend-react/src/App.tsx",
    "frontend-react/src/main.tsx",
    "frontend-react/vite.config.ts"

]

# --- COMPONENTES COMPARTIDOS (Opcionales) ---
# Se incluyen/excluyen según la respuesta del usuario al inicio.
SHARED_DIRECTORIES = [
    "backend/src/shared",
    "backend/migrations",
    "frontend-react/src/shared",
    "backend/src/users",
    "frontend-react/src/user",
    "frontend-react/src/auth",
]

# --- DEFINICIÓN DE MÓDULOS (Vertical Slices) ---
# Solo las rutas específicas de cada dominio. Se combinan con Global + Shared dinámicamente.
MODULE_DEFINITIONS = {
    "Contacts": [
        "backend/src/contacts",
        "frontend-react/src/contacts",
    ],
    "Inventory": [
        "backend/src/inventory",
        "frontend-react/src/inventory",
    ],
    "Sales (CRM)": [
        "backend/src/sales",
        "frontend-react/src/sales",
    ],
    "Purchasing": [
        "backend/src/purchasing",
        "frontend-react/src/purchasing",
    ],
    "Messages / Chat": [
        "backend/src/messages",
        "frontend-react/src/chat",
    ],
    "Knowledge": [
        "backend/src/knowledge",
        "frontend-react/src/knowledge",
    ],
    "Location (Geo)": [
        "backend/src/location",
    ],
    "Pricing": [
        "backend/src/pricing",
        "frontend-react/src/pricing",
    ]
}

# Extensiones de archivo que el script buscará y exportará.
FILE_EXTENSIONS_TO_INCLUDE = (
    ".py", ".yml", ".sh", ".env", ".conf", ".txt", ".md", ".json", ".html",
    "Dockerfile", ".jsx", ".css", ".js", ".ts", ".tsx", ".ini",
)

# --- CONFIGURACIÓN DE EXCLUSIÓN ---
PATHS_TO_EXCLUDE = [
    ".ruff_cache",
    "docker-compose.yml",
    "nginx/default.conf",
    "docker-compose_dev.yml",
    ".git/",
    "__pycache__/",
    ".venv/",
    ".vscode/",
    "frontend-react/node_modules/",
    "node_modules/",
    "frontend/build/",
    ".mypy_cache/",
    "backend/.venv/",
    "backend/.mypy_cache/",
    "frontend-react/package-lock.json",
    "frontend-react/postcss.config.js",
    "frontend-react/dist/",
    "full_project_content_export.txt",
    "project_structure_tree.txt",
    "export_project_old.py",
    "volumes/",
    ".zed/",
    "backend/build/",
    "backend/src/_module_template/",
    ".pytest_cache/",
    "backend/src/ai_assistant.egg-info/",
    "documents/",
    "tree.txt",
    "get_clean_db.sh",
    "install_dev_env.sh",
    "data/01_restore.sh",
    "package-lock.json",
    "README.md",
    "backend/README.md",
]

OUTPUT_FILE = "full_project_content_export.txt"
PROJECT_TREE_FILE = "project_structure_tree.txt"


def resolve_presets(include_shared: bool):
    """
    Genera el diccionario final de presets combinando:
    GLOBAL_CONTEXT + (SHARED_DIRECTORIES si aplica) + MODULE_DEFINITIONS
    """
    presets = {}
    for name, specific_paths in MODULE_DEFINITIONS.items():
        # Base siempre incluye el esqueleto global
        full_paths = GLOBAL_CONTEXT + specific_paths

        # Inyección condicional de Shared
        if include_shared:
            full_paths += SHARED_DIRECTORIES

        presets[name] = full_paths
    return presets


def get_user_selection():
    """
    Solicita configuración y módulo al usuario.
    Retorna: (tipo_seleccion, data)
    """
    print("\n--- CONFIGURACIÓN DE CONTEXTO ---")
    share_input = input(
        "¿Incluir archivos 'shared' (kernel/infra base)? [S/n]: ").strip().lower()
    include_shared = share_input != 'n'
    status_msg = "INCLUIDOS" if include_shared else "EXCLUIDOS"
    print(f"[INFO] Archivos compartidos: {status_msg}")

    # Generar presets basados en la decisión
    current_presets = resolve_presets(include_shared)
    module_keys = list(current_presets.keys())

    print("\n--- SELECCIÓN DE EXPORTACIÓN ---")
    print("1. Backend Only (Excluye carpeta frontend)")
    print("2. Frontend Only (Incluye Frontend + Entidades y APIs del Backend)")
    print("3. Both (Proyecto completo desde la raíz)")

    start_idx = 4
    for idx, name in enumerate(module_keys, start=start_idx):
        print(f"{idx}. Módulo: {name}")

    custom_idx = start_idx + len(module_keys)
    print(f"{custom_idx}. Directorio Específico (Ruta manual)")

    while True:
        choice_input = input(
            f"\nSeleccione opción(es) separadas por coma (1-{custom_idx}, ej: 4,6): ").strip()

        # Opciones Globales (1-3) - Exclusivas (no mezclar con módulos)
        if choice_input in ['1', '2', '3']:
            return choice_input, None

        # Opción Manual - Exclusiva
        if choice_input == str(custom_idx):
            custom_path = input(
                "Ingrese la ruta del directorio (ej: backend/src/users): ").strip()
            custom_path = custom_path.replace('"', '').replace("'", "")
            if os.path.isdir(custom_path):
                return 'custom', [custom_path]
            else:
                print(f"ERROR: La ruta '{custom_path}' no existe.")
                continue

        # Lógica Multi-Módulo
        try:
            # Parsear entradas separadas por coma
            indices = [int(x.strip()) for x in choice_input.split(',') if
                       x.strip().isdigit()]

            if not indices:
                print("Entrada inválida.")
                continue

            selected_paths = []
            selected_names = []

            for idx in indices:
                if start_idx <= idx < custom_idx:
                    module_name = module_keys[idx - start_idx]
                    # Acumulamos las rutas del preset
                    selected_paths.extend(current_presets[module_name])
                    selected_names.append(module_name)
                else:
                    print(f"[WARN] Índice {idx} fuera de rango o no es un módulo.")

            if selected_paths:
                print(f"\n[INFO] Módulos seleccionados: {', '.join(selected_names)}")
                # Retornamos set list para eliminar duplicados (ej: shared se agrega en cada preset)
                return 'module', list(set(selected_paths))

        except ValueError:
            pass

        print("Opción inválida. Intente de nuevo.")


def apply_selection_logic(file_list, selection):
    """
    Filtra la lista de archivos basándose en la selección del usuario.
    """
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

        else:  # Both
            filtered_list.append(file_path)

    return filtered_list


def generate_project_tree(start_dirs, files_to_process):
    """
    Genera un árbol de directorios consolidado para múltiples raíces.
    """
    tree_lines = ["Árbol de directorios de archivos exportados:\n"]
    processed_files_set = {os.path.normpath(f) for f in files_to_process}
    dirs_to_iterate = start_dirs if isinstance(start_dirs, list) else [start_dirs]

    global_excludes = set()
    path_excludes = set()
    
    universal_excludes = {".git", "__pycache__", "node_modules", ".venv", ".opencode", ".zed", ".pytest_cache"}
    all_excludes = set(PATHS_TO_EXCLUDE).union(universal_excludes)

    for p in all_excludes:
        p_clean = p.rstrip('/\\')
        if not p_clean: continue
        if os.sep in p_clean or '/' in p_clean or '\\' in p_clean:
            path_excludes.add(os.path.normpath(p_clean))
        else:
            global_excludes.add(p_clean)

    for base_dir in dirs_to_iterate:
        if not os.path.exists(base_dir):
            continue

        tree_lines.append(f"\n--- Raíz de escaneo: {base_dir} ---\n")

        for root, dirs, files in os.walk(base_dir, topdown=True):
            # Exclusión de directorios en el árbol
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
            rel_path = os.path.relpath(root, base_dir)
            if rel_path == ".":
                level = 0
            else:
                level = rel_path.count(os.sep) + 1

            indent = "│   " * level
            dirname = os.path.basename(root)

            if level != 0:
                tree_lines.append(f"{indent}├── {dirname}/\n")

            sub_indent = "│   " * (level + 1)
            display_files = [
                f for f in files
                if os.path.normpath(os.path.join(root, f)) in processed_files_set
            ]

            for f in sorted(display_files):
                tree_lines.append(f"{sub_indent}├── {f}\n")

    return "".join(tree_lines)


def find_project_files(base_directories, extensions_to_include):
    found_files = []
    print(f"\nBuscando archivos en: {base_directories}")

    for base_dir in base_directories:
        if not os.path.exists(base_dir):
            print(f"  [ADVERTENCIA] Ruta no encontrada: {base_dir}")
            continue

        if os.path.isfile(base_dir):
            if base_dir.endswith(extensions_to_include):
                found_files.append(base_dir)
            continue

        for root, _, files in os.walk(base_dir):
            for file in files:
                if file.endswith(extensions_to_include):
                    full_path = os.path.join(root, file)
                    found_files.append(full_path)

    print(f"Se encontraron {len(found_files)} archivos candidatos.")
    return sorted(found_files)


def filter_excluded_paths(file_list, exclusion_list):
    global_excludes = set()
    path_excludes = set()

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

        if base_name.startswith("SKARCH_") or base_name.startswith("SKDEV_"):
            continue

        path_parts = normalized_file_path.split(os.sep)
        if any(part in global_excludes for part in path_parts):
            continue

        is_excluded = False
        for p_ext in path_excludes:
            if normalized_file_path == p_ext or normalized_file_path.startswith(p_ext + os.sep):
                is_excluded = True
                break

        if not is_excluded:
            filtered_list.append(file_path)

    return filtered_list


def export_project_content(project_files_list):
    print(f"\nIniciando la exportación del contenido a '{OUTPUT_FILE}'...")
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
            outfile.write(
                f"--- Contenido del Proyecto Exportado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n")
            processed_count = 0
            for file_path in project_files_list:
                header = f"\n\n// --- {file_path} ---\n\n"
                outfile.write(header)
                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        content = infile.read()
                        outfile.write(content)
                    print(f"  [OK] Procesado: {file_path}")
                    processed_count += 1
                except Exception as e:
                    outfile.write(
                        f"*** ERROR AL LEER EL ARCHIVO: {file_path} | Motivo: {e} ***\n")
                    print(f"  [ERROR] {file_path}: {e}")
            print(
                f"\nExportación completada. Se procesaron {processed_count} archivos.")
    except IOError as e:
        print(f"[ERROR CRÍTICO] No se pudo escribir '{OUTPUT_FILE}': {e}")


def write_project_tree(tree_content):
    try:
        with open(PROJECT_TREE_FILE, "w", encoding="utf-8") as treefile:
            treefile.write(tree_content)
        print(f"El árbol de directorios ha sido guardado en '{PROJECT_TREE_FILE}'.")
    except IOError as e:
        print(f"[ERROR CRÍTICO] Error escribiendo árbol: {e}")


if __name__ == "__main__":
    # 1. Selección de Usuario (con lógica Shared)
    selection_type, selection_data = get_user_selection()

    # 2. Definir directorios
    if selection_type in ['module', 'custom']:
        directories_to_scan = selection_data
    else:
        directories_to_scan = DEFAULT_DIRECTORIES_TO_SCAN

    # 3. Escaneo
    all_project_files = find_project_files(directories_to_scan,
                                           FILE_EXTENSIONS_TO_INCLUDE)

    # 4. Filtrado Global
    print("\nAplicando filtros de exclusión globales...")
    globally_filtered_files = filter_excluded_paths(all_project_files, PATHS_TO_EXCLUDE)

    # 5. Filtrado Lógico
    files_to_process = apply_selection_logic(globally_filtered_files, selection_type)

    print(f"Total de archivos a procesar final: {len(files_to_process)}")

    if not files_to_process:
        print("\nNo se encontraron archivos que procesar. Saliendo.")
    else:
        if selection_type in ['module', 'custom']:
            full_scan = find_project_files(DEFAULT_DIRECTORIES_TO_SCAN,
                                           FILE_EXTENSIONS_TO_INCLUDE)
            tree_files = filter_excluded_paths(full_scan, PATHS_TO_EXCLUDE)
            project_tree = generate_project_tree(DEFAULT_DIRECTORIES_TO_SCAN,
                                                 tree_files)
        else:
            project_tree = generate_project_tree(directories_to_scan,
                                                 globally_filtered_files)

        write_project_tree(project_tree)
        export_project_content(files_to_process)
