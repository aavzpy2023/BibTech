import os
from datetime import datetime

try:
    from _scripts.dev.config import ExportConfig, PATHS_TO_EXCLUDE, TREE_DIRS_TO_EXCLUDE
    from _scripts.dev.compression import compress_python_ast, compress_typescript_ast
except ModuleNotFoundError:
    from config import ExportConfig, PATHS_TO_EXCLUDE, TREE_DIRS_TO_EXCLUDE
    from compression import compress_python_ast, compress_typescript_ast

def generate_manifest_header(config: ExportConfig, processed_count: int, modules: list) -> str:
    manifest =[
        "=== SK-CONTEXT MANIFEST ===",
        f"Intent: {config.intent_name}",
        f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"AST Mode: {config.use_ast}",
        f"Line Numbers: {config.use_line_numbers}",
        f"Modules: {', '.join(modules) if modules else 'Global/Custom'}",
        f"Processed Files: {processed_count}",
        "===========================\n\n"
    ]
    return "\n".join(manifest)

def generate_project_tree(base_directories, found_files, bypass_exclusions=False):
    tree_lines =["Árbol de directorios de archivos exportados:\n"]
    processed_files_set = {os.path.normpath(f) for f in found_files}
    dirs_to_iterate = base_directories if isinstance(base_directories, list) else [base_directories]

    global_excludes = set()
    path_excludes = set()
    
    all_excludes = set(TREE_DIRS_TO_EXCLUDE)
    if not bypass_exclusions:
        all_excludes.update(PATHS_TO_EXCLUDE)

    for p in all_excludes:
        p_clean = p.rstrip('/\\')
        if not p_clean: continue
        if os.sep in p_clean or '/' in p_clean or '\\' in p_clean:
            path_excludes.add(os.path.normpath(p_clean))
        else:
            global_excludes.add(p_clean)

    for base_dir in dirs_to_iterate:
        if not os.path.exists(base_dir): continue
        tree_lines.append(f"\n--- Raíz de escaneo: {base_dir} ---\n")

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
            rel_path = os.path.relpath(root, base_dir)
            level = 0 if rel_path == "." else rel_path.count(os.sep) + 1
            indent = "│   " * level
            dirname = os.path.basename(root)

            if level != 0: tree_lines.append(f"{indent}├── {dirname}/\n")
            sub_indent = "│   " * (level + 1)
            display_files =[f for f in files if os.path.normpath(os.path.join(root, f)) in processed_files_set]
            for f in sorted(display_files):
                tree_lines.append(f"{sub_indent}├── {f}\n")
    return "".join(tree_lines)


def _format_line_with_indent(idx: int, line: str) -> str:
    spaces = len(line) - len(line.lstrip(" \t"))
    return f"[L{idx:03d}, S{spaces}] {line}"


def export_project_content(project_files_list, config: ExportConfig,
                           selected_names: list, missing_files: list = None,
                           target_map: dict = None):
    print(
        f"\nIniciando exportación Pipeline[{config.intent_name}] hacia '{config.content_file}'...")
    try:
        os.makedirs(os.path.dirname(os.path.abspath(config.content_file)), exist_ok=True)
        with open(config.content_file, "w", encoding="utf-8") as outfile:
            if config.active_roadmap_name:
                outfile.write(f"ACTIVE ROADMAP NAME: {config.active_roadmap_name}\n\n")
            outfile.write(generate_manifest_header(config, len(project_files_list),
                                                   selected_names))
            
            if config.roadmap_text:
                outfile.write(config.roadmap_text + "\n")
                outfile.write("\n" + "=" * 60 + "\n")

            processed_count = 0
            for file_path in project_files_list:
                outfile.write(f"\n\n// --- {file_path} ---\n\n")
                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        content = infile.read()
                        if config.use_ast:
                            target_entities = target_map.get(file_path, []) if target_map else []
                            if target_entities == ["TAIL"]:
                                content = "".join(content.splitlines(True)[-50:])
                            elif target_entities != ["*"]:
                                if file_path.endswith(".py"):
                                    content = compress_python_ast(content, file_path, target_entities)
                                elif file_path.endswith((".ts", ".tsx")):
                                    content = compress_typescript_ast(content, file_path)

                        if config.use_line_numbers:
                            content = "\n".join([
                                _format_line_with_indent(idx, line)
                                for idx, line in enumerate(content.splitlines(), 1)
                            ])

                        outfile.write(content + "\n")
                    print(f"  [OK] Procesado: {file_path}")
                    processed_count += 1
                except Exception as e:
                    outfile.write(f"*** ERROR AL LEER: {file_path} | {e} ***\n")
            
            if False and missing_files:  # [Anti-Noise] Silently ignore missing files
                outfile.write("\n\n=== 🛑 MISSING FILES REPORT ===\n")
                outfile.write("The following requested files DO NOT EXIST in the project:\n")
                for file in missing_files:
                    outfile.write(f"- {file}\n")
                    outfile.write(
                            "[SYSTEM LOG] Do not request these files again. "
                            "Re-evaluate your strategy. [CRITICAL] File not found. "
                            "Review the AST tree above to find the correct path.\n"
                        )

            print(f"\nCompletado. {processed_count} archivos exportados.")
    except IOError as e:
        print(f"[ERROR CRÍTICO] I/O: {e}")

def write_project_tree(tree_content, config: ExportConfig):
    try:
        os.makedirs(os.path.dirname(os.path.abspath(config.tree_file)), exist_ok=True)
        with open(config.tree_file, "w", encoding="utf-8") as treefile:
            treefile.write(tree_content)
        print(f"El árbol ha sido guardado en '{config.tree_file}'.")
    except IOError as e:
        print(f"[ERROR CRÍTICO] Error escribiendo árbol: {e}")
