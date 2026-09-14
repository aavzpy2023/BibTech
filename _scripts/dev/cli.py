import os
import re
import sys
import argparse

try:
    from _scripts.dev.config import (
        ExportConfig,
        MODULE_DEFINITIONS,
        GLOBAL_CONTEXT,
        SHARED_DIRECTORIES,
        OUTPUT_DIR,
    )
    from _scripts.dev.discovery import discover_modules
except ImportError:
    from config import (
        ExportConfig,
        MODULE_DEFINITIONS,
        GLOBAL_CONTEXT,
        SHARED_DIRECTORIES,
        OUTPUT_DIR,
    )
    from discovery import discover_modules

def resolve_presets(include_shared: bool):
    """Genera el diccionario final de presets de forma determinista basándose estrictamente en config.py."""
    presets = {}
    for name, specific_paths in MODULE_DEFINITIONS.items():
        full_paths = list(GLOBAL_CONTEXT) + specific_paths
        if include_shared:
            full_paths += SHARED_DIRECTORIES
        presets[name] = full_paths
    return presets

def is_custom_array_payload(selection_data) -> bool:
    """Pure function to detect if the payload is a list of specific files."""
    return isinstance(selection_data, list) and len(selection_data) > 0 and isinstance(selection_data[0], str)

def get_user_selection():
    """Solicita configuración y módulo al usuario. Soporta argumentos CLI para automatización."""
    parser = argparse.ArgumentParser(description="SK Context Exporter")
    parser.add_argument("--intent", type=str, help="1: SKARCH, 2: SKDEV, 3: Auto")
    parser.add_argument("--shared", type=str, default="s", help="s/n para incluir shared")
    parser.add_argument("--export", type=str, help="1-3: Global, 4+: Modules, custom_idx: Manual")
    parser.add_argument("--paths", type=str, help="Lista de rutas si --export es manual")
    parser.add_argument("pos_args", nargs="*", help="Argumentos posicionales opcionales")
    args, _ = parser.parse_known_args()

    # Soporte Híbrido: Flags o Posicionales (inyectados por Make)
    pos = args.pos_args
    intent_val = args.intent or (pos[0] if len(pos) > 0 else None)

    if args.intent:
        shared_val = args.shared 
    else:
        shared_val = pos[1] if len(pos) > 1 else "s"

    export_val = args.export or (pos[2] if len(pos) > 2 else None)
    paths_val = args.paths or (",".join(pos[3:]) if len(pos) > 3 else None)

    # --- SMART AUTO-DETECTION: Omitir el índice manual ---
    if export_val and not re.match(r'^[\d\s,]+$', str(export_val)):
        paths_val = str(export_val)
        if len(pos) > 3:
            paths_val += "," + ",".join(pos[3:])
        export_val = "CUSTOM_AUTO"

    is_cli = bool(intent_val)

    if is_cli:
        intent_choice = str(intent_val).strip()
    else:
        print("\n--- INTENT ORCHESTRATOR ---")
        print("1. Planificación (SKARCH) - Comprime AST, nombres de archivo SKARCH_*")
        print("2. Desarrollo (SKDEV) - Números de línea, nombres de archivo SKDEV_*")
        print("3. Auto-Ejecución (Lee SKARCH_roadmap.txt y genera SKDEV_content.txt)")
        intent_choice = input("Seleccione Intención [1/2/3]: ").strip()

    if intent_choice == "3":
        config = ExportConfig(
            intent_name="SKDEV", use_ast=False, use_line_numbers=True,
            content_file=os.path.join(OUTPUT_DIR, "SKDEV_content.txt"), 
            tree_file=os.path.join(OUTPUT_DIR, "SKDEV_tree.txt")
        )
        roadmap_file = "SKARCH_roadmap.txt"
        if not os.path.exists(roadmap_file):
            print(f"\n[ERROR] No se encontró el archivo {roadmap_file}.")
            print("Cree el archivo en la raíz, pegue el output de SKARCH y vuelva a intentar.")
            sys.exit(1)

        with open(roadmap_file, "r", encoding="utf-8") as f:
            raw_text = f.read()

        roadmap_match = re.search(r'(PART 3:.*?)(?=PART 4|PART 5|$)', raw_text, re.DOTALL | re.IGNORECASE)
        if roadmap_match:
            config.roadmap_text = roadmap_match.group(1).strip()
            print("\n[INFO] 📄 Roadmap (PART 3) detectado e inyectado con éxito.")
        else:
            print("\n[WARN] ⚠️ No se detectó 'PART 3:' en el archivo. Solo se exportará el código.")

        array_matches = re.findall(r'\[(.*?)\]', raw_text, re.DOTALL)
        paths_content = ""
        if array_matches:
            for match in reversed(array_matches):
                if '"' in match or "'" in match or '/' in match or '.py' in match or '.ts' in match:
                    paths_content = match
                    break
            if not paths_content:
                paths_content = array_matches[-1]

        if not paths_content.strip():
            part4_match = re.search(r'PART 4.*?:(.*)', raw_text, re.DOTALL | re.IGNORECASE)
            if part4_match:
                paths_content = part4_match.group(1)
            else:
                paths_content = raw_text

        cleaned_paths = re.sub(r'[\'"]', '', paths_content).replace('\n', ',')
        raw_paths = [p.strip() for p in cleaned_paths.split(',') if p.strip()]

        valid_paths, invalid_paths = [], []
        for p in raw_paths:
            if os.path.exists(p):
                valid_paths.append(p)
            else:
                invalid_paths.append(p)

        if invalid_paths:
            print(f"\n[ADVERTENCIA] No se encontraron las siguientes rutas:\n  - " + "\n  - ".join(invalid_paths))

        if not valid_paths:
            print("\nERROR: Ninguna ruta es válida o el array está vacío. Saliendo...")
            sys.exit(1)

        custom_names = [os.path.basename(os.path.normpath(p)) for p in valid_paths]
        print(f"\n[INFO] Auto-Ejecución iniciada con éxito.")
        print(f"[INFO] Rutas validadas: {', '.join(valid_paths)}")
        return config, 'custom', valid_paths, custom_names

    if intent_choice == "1":
        config = ExportConfig(
            intent_name="SKARCH", use_ast=True, use_line_numbers=False,
            content_file=os.path.join(OUTPUT_DIR, "SKARCH_content.txt"), 
            tree_file=os.path.join(OUTPUT_DIR, "SKARCH_tree.txt")
        )
    else:
        config = ExportConfig(
            intent_name="SKDEV", use_ast=False, use_line_numbers=True,
            content_file=os.path.join(OUTPUT_DIR, "SKDEV_content.txt"), 
            tree_file=os.path.join(OUTPUT_DIR, "SKDEV_tree.txt")
        )

    config.active_roadmap_name = os.environ.get("SK_ROADMAP_NAME")
    print(f"\n[INFO] Intención seleccionada: {config.intent_name}")
    
    if is_cli:
        share_input = str(shared_val).strip().lower()
    else:
        print("\n--- CONFIGURACIÓN DE CONTEXTO ---")
        share_input = input("¿Incluir archivos 'shared' (kernel/infra base)? [S/n]: ").strip().lower()
            
    include_shared = share_input != 'n'
    print(f"[INFO] Archivos compartidos: {'INCLUIDOS' if include_shared else 'EXCLUIDOS'}")

    current_presets = resolve_presets(include_shared)
    module_keys = list(current_presets.keys())

    start_idx = 4
    custom_idx = start_idx + len(module_keys)

    if not is_cli:
        print("\n--- SELECCIÓN DE EXPORTACIÓN ---")
        print("1. Backend Only (Excluye carpeta frontend)")
        print("2. Frontend Only (Incluye Frontend + Entidades y APIs del Backend)")
        print("3. Both (Proyecto completo desde la raíz)")

        for idx, name in enumerate(module_keys, start=start_idx):
            print(f"{idx}. Módulo: {name}")

        print(f"{custom_idx}. Directorio(s) Específico(s) (Rutas manuales desde SKARCH)")

    while True:
        if is_cli:
            if export_val == "CUSTOM_AUTO":
                choice_input = str(custom_idx)
            else:
                if not export_val:
                    print("[ERROR] En modo CLI posicional es obligatorio proveer el módulo.")
                    sys.exit(1)
                choice_input = str(export_val).strip()
        else:
            choice_input = input(f"\nSeleccione opción(es) separadas por coma (1-{custom_idx}): ").strip()

        if choice_input in ['1', '2', '3']:
            return config, choice_input, None, []

        if choice_input == str(custom_idx):
            if is_cli:
                if not paths_val:
                    print("[ERROR] En modo CLI para rutas manuales es obligatorio proveer la lista de paths.")
                    sys.exit(1)
                custom_paths_input = str(paths_val)
            else:
                print("\n[INFO] Puede pegar la lista de rutas generada por SKARCH.")
                print("Ejemplo: [\"backend/src/messages\", \"backend/src/users\"]")
                custom_paths_input = input("Ingrese la(s) ruta(s) manuales: ").strip()

            try:
                import json
                parsed_json = json.loads(custom_paths_input)
                if isinstance(parsed_json, dict):
                    parsed_json = parsed_json.get(
                        "missing_files", parsed_json.get("context_radius", parsed_json)
                    )
                    if "TREE_ONLY" in parsed_json:
                        return config, 'custom', parsed_json, ["TREE_ONLY"]
                    valid_paths = {p: v for p, v in parsed_json.items() if os.path.exists(p)}
                    invalid_paths = [p for p in parsed_json.keys() if not os.path.exists(p)]
                    if invalid_paths:
                        print(f"\n[ADVERTENCIA] No se encontraron las siguientes rutas: {', '.join(invalid_paths)}")
                        if not valid_paths:
                            print("ERROR: Ninguna de las rutas proporcionadas es válida. Intente de nuevo.")
                            if is_cli: sys.exit(1)
                            continue
                        if is_cli:
                            print("[CLI MODE] Continuando con rutas válidas.")
                        elif input("¿Desea continuar exportando solo las rutas válidas? [S/n]: ").strip().lower() == 'n':
                            continue
                    if valid_paths:
                        custom_names = [os.path.basename(os.path.normpath(p)) for p in valid_paths.keys()]
                        print(f"\n[INFO] Rutas manuales validadas: {', '.join(valid_paths.keys())}")
                        return config, 'custom', valid_paths, custom_names
                    continue
            except Exception:
                pass

            array_match = re.search(r'\[(.*?)\]', custom_paths_input, re.DOTALL)
            if array_match:
                custom_paths_input = array_match.group(1)

            cleaned_input = re.sub(r'[\'"]', '', custom_paths_input).replace('\n', ',')
            raw_paths = [p.strip() for p in cleaned_input.split(',') if p.strip()]

            valid_paths = []
            invalid_paths = []

            for p in raw_paths:
                if os.path.exists(p):
                    valid_paths.append(p)
                else:
                    invalid_paths.append(p)

            if invalid_paths:
                print(f"\n[ADVERTENCIA] No se encontraron las siguientes rutas: {', '.join(invalid_paths)}")
                if not valid_paths:
                    print("ERROR: Ninguna de las rutas proporcionadas es válida. Intente de nuevo.")
                    if is_cli: sys.exit(1)
                    continue

                if is_cli:
                    print("[CLI MODE] Continuando con rutas válidas.")
                else:
                    proceed = input("¿Desea continuar exportando solo las rutas válidas? [S/n]: ").strip().lower()
                    if proceed == 'n':
                        continue

            if valid_paths:
                custom_names = [os.path.basename(os.path.normpath(p)) for p in valid_paths]
                print(f"\n[INFO] Rutas manuales validadas: {', '.join(valid_paths)}")
                return config, 'custom', valid_paths, custom_names
            else:
                continue

        try:
            indices = [int(x.strip()) for x in choice_input.split(',') if x.strip().isdigit()]
            if not indices:
                print("Entrada inválida.")
                continue

            selected_paths, selected_names = [], []
            for idx in indices:
                if start_idx <= idx < custom_idx:
                    module_name = module_keys[idx - start_idx]
                    selected_paths.extend(current_presets[module_name])
                    selected_names.append(module_name)
                else:
                    print(f"[WARN] Índice {idx} fuera de rango.")

            if selected_paths:
                print(f"\n[INFO] Módulos seleccionados: {', '.join(selected_names)}")
                return config, 'module', list(set(selected_paths)), selected_names

        except ValueError:
            pass
            
        print("Opción inválida. Intente de nuevo.")
        if is_cli: sys.exit(1)
