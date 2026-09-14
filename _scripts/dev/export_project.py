import os
import sys
import subprocess
import shutil

_curr = os.path.dirname(os.path.abspath(__file__))
if _curr not in sys.path:
    sys.path.insert(0, _curr)

# Importación de la arquitectura modular del exportador
from config import (
    DEFAULT_DIRECTORIES_TO_SCAN,
    FILE_EXTENSIONS_TO_INCLUDE,
    PATHS_TO_EXCLUDE,
    TREE_DIRS_TO_EXCLUDE
)
from cli import get_user_selection, is_custom_array_payload
from discovery import (
    find_project_files,
    force_find_files,
    filter_excluded_paths,
    apply_selection_logic
)
from generator import (
    generate_project_tree,
    write_project_tree,
    export_project_content
)


def _ensure_db_architecture_exists():
    """
    [HOOK] Story 1.1: Garantiza que SK_db_architecture.txt esté presente.
    Si no existe, corre el script de exportación de DB (Docker) de forma síncrona.
    """
    arch_file = "SK_db_architecture.txt"
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
    db_script = os.path.join(root_dir, "_scripts", "db", "export_db.sh")

    # 1. Caso Ideal: El archivo ya fue creado por Alembic o una ejecución previa
    if os.path.exists(arch_file):
        print(f"[INFO] 📂 Arquitectura detectada: {arch_file} (Saltando sincronización)")
        return

    # 2. Caso de Respaldo: El archivo no existe, intentamos generarlo
    print(
        f"\n[HOOK] ⚠️ No se encontró {arch_file}. Intentando generar desde base de datos...")

    if not os.path.exists(db_script):
        print(f"[ERROR] ❌ No se encontró el script de respaldo en: {db_script}")
        print("[INFO] Continuando exportación sin el esquema de base de datos...")
        return

    try:
        # Ejecutar el script de bash de forma síncrona
        # Se captura la salida para no ensuciar la consola a menos que haya error
        result = subprocess.run(
            ["bash", db_script],
            capture_output=True,
            text=True,
            check=True
        )

        if os.path.exists(arch_file):
            print(f"[OK] ✅ {arch_file} generado exitosamente mediante el Hook.")
        else:
            print(
                f"[WARN] ❓ El script terminó pero no se detectó el archivo {arch_file}.")

    except subprocess.CalledProcessError as e:
        print(
            f"[ERROR] ❌ Falló la generación de arquitectura (¿Contenedor Postgres apagado?)")
        print(
            f"       Detalle del error: {e.stderr.strip() if e.stderr else 'Desconocido'}")
        print("[INFO] Continuando exportación de archivos de código solamente...")

    except Exception as e:
        print(f"[ERROR] ❌ Error inesperado en el Hook de DB: {e}")


if __name__ == "__main__":
    # --- PASO 0: Sincronización de Arquitectura ---
    _ensure_db_architecture_exists()

    # --- PASO 1: Selección y Configuración del Usuario ---
    # config: Objeto ExportConfig (SKARCH o SKDEV)
    # selection_type: 'module', 'custom', '1' (Backend), '2' (Frontend), '3' (Both)
    config, selection_type, selection_data, selected_names = get_user_selection()

    if selection_type in ['module', 'custom']:
        # Si es un módulo o ruta manual, escaneamos solo esas carpetas
        directories_to_scan = selection_data
    else:
        # Si es global (1, 2 o 3), escaneamos desde la raíz (.)
        directories_to_scan = DEFAULT_DIRECTORIES_TO_SCAN

    # --- PASO 2 & 3: Escaneo y Aplicación de Filtros ---
    active_excludes = list(set(PATHS_TO_EXCLUDE) | set(TREE_DIRS_TO_EXCLUDE))
    
    missing_files = []
    is_tree_only = isinstance(selection_data, dict) and "TREE_ONLY" in selection_data

    is_custom_array = is_custom_array_payload(selection_data)
    if is_custom_array:
        config.use_ast = False

    if selection_type == 'custom':
        if is_tree_only:
            files_to_process = []
            missing_files = []
        else:
            files_to_process = force_find_files(selection_data)
            missing_files = [f for f in selection_data if not os.path.exists(f)]
    else:
        all_project_files = find_project_files(directories_to_scan, FILE_EXTENSIONS_TO_INCLUDE)
        
        print("\nAplicando filtros de exclusión...")
        globally_filtered_files = filter_excluded_paths(all_project_files, active_excludes)
        
        print(f"Aplicando lógica de segmentación para Intención: {config.intent_name}...")
        files_to_process = apply_selection_logic(globally_filtered_files, selection_type)

    print(f"Total de archivos a procesar final: {len(files_to_process)}")

    if not files_to_process and not is_tree_only:
        print(
            "\n[ERROR] No se encontraron archivos para exportar con los criterios seleccionados.")
    else:
        # --- PASO 4: Generación del Árbol de Directorios ---
        # El árbol siempre se genera sobre la raíz total para dar contexto de ubicación
        print("\nGenerando mapa de estructura del proyecto...")
        full_scan = find_project_files(DEFAULT_DIRECTORIES_TO_SCAN,
                                       FILE_EXTENSIONS_TO_INCLUDE)
        
        tree_files = filter_excluded_paths(full_scan, active_excludes)
        tree_files_union = list(set(tree_files) | set(files_to_process))
        project_tree = generate_project_tree(
            DEFAULT_DIRECTORIES_TO_SCAN,
            tree_files_union,
            bypass_exclusions=(selection_type == 'custom')
        )

        # --- PASO 5: Escritura del Árbol y Contenido ---
        # write_project_tree guarda SKARCH_tree.txt o SKDEV_tree.txt
        write_project_tree(project_tree, config)

        if config.intent_name == "SKARCH" and os.path.exists("SKARCH_tree.txt"):
            shutil.copyfile("SKARCH_tree.txt", "SKDEV_tree.txt")

        # export_project_content procesa el bundling (AST o Números de línea)
        target_map = selection_data if isinstance(selection_data, dict) else None
        if not is_tree_only:
            export_project_content(
                files_to_process, config, selected_names, missing_files, target_map
            )

        print(f"\n[EXITO] Proceso finalizado para Intención: {config.intent_name}")
