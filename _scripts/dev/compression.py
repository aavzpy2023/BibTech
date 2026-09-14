import ast
import subprocess
import os

try:
    from _scripts.dev.config import AST_COMPRESSION_BYPASS
except ImportError:
    from config import AST_COMPRESSION_BYPASS


def compress_python_ast(source_text: str, file_path: str = "", target_entities: list = None) -> str:
    """Comprime código Python reteniendo solo firmas (AST), excepto para archivos de Wiring."""
    if target_entities is None or target_entities == ["*"]:
        return source_text

    # 1. BYPASS CHECK: Si es un archivo de cableado, devolverlo intacto
    if file_path.endswith(tuple(AST_COMPRESSION_BYPASS)):
        return source_text

    try:
        tree = ast.parse(source_text)

        class Stubber(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                if f"def {node.name}" not in target_entities and node.name not in target_entities:
                    node.body = [ast.Expr(value=ast.Constant(value="..."))]
                return node

            def visit_AsyncFunctionDef(self, node):
                if f"def {node.name}" not in target_entities and node.name not in target_entities:
                    node.body = [ast.Expr(value=ast.Constant(value="..."))]
                return node

            def visit_ClassDef(self, node):
                if f"class {node.name}" not in target_entities and node.name not in target_entities:
                    node.body = [ast.Expr(value=ast.Constant(value="..."))]
                else:
                    self.generic_visit(node)
                return node

        return ast.unparse(Stubber().visit(tree))
    except Exception:
        return source_text


def compress_typescript_ast(source_text: str, file_path: str = "") -> str:
    """Comprime código TypeScript/React utilizando AST, con Bypass para Wiring."""

    # 1. BYPASS CHECK
    if file_path.endswith(tuple(AST_COMPRESSION_BYPASS)):
        return source_text

    script_path = os.path.join(os.path.dirname(__file__), 'ts_compressor.js')

    try:
        result = subprocess.run(
            ['node', script_path],
            input=source_text,
            text=True,
            capture_output=True,
            check=True
        )
        return result.stdout
    except (FileNotFoundError, subprocess.CalledProcessError):
        return _compress_typescript_regex(source_text)


def _compress_typescript_regex(source_text: str) -> str:
    """Compresión Regex Legacy (Fallback de seguridad)."""
    lines = source_text.split('\n')
    compressed, in_block, brace_count = [], False, 0

    for line in lines:
        stripped = line.strip()
        if stripped.startswith(
            ("import ", "export interface ", "export type ", "type ", "interface ")):
            compressed.append(line)
            if "{" in line and "}" not in line:
                in_block = True
                brace_count += line.count("{") - line.count("}")
            continue

        if in_block:
            compressed.append(line)
            brace_count += line.count("{") - line.count("}")
            if brace_count <= 0:
                in_block, brace_count = False, 0
            continue

        if stripped.startswith(("export const ", "const ")):
            if "=>" in line or "function" in line:
                compressed.append(line.split("=>")[0] + "=> { /* ... */ };")
            else:
                compressed.append(line)
            continue

        if stripped.startswith(
            ("export function ", "function ", "class ", "export class ")):
            compressed.append(line.split("{")[0] + "{ /* ... */ }")

    return "\n".join(compressed) if compressed else source_text
