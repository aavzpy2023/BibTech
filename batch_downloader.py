import urllib.request
import urllib.error
import json
import sys
import zipfile
from pathlib import Path


def main():
    print("=== Local File Batch Downloader ===")
    file_path = input("Path del .bib: ").strip()
    destination = input("Folder name: ").strip()
    email = input("Correo: ").strip()

    url = "http://localhost:88/api/bibliography/batch-download-local"
    # Mapeo automático de rutas locales al punto de montaje Docker (/project)
    container_file_path = f"/project/{file_path}" if not file_path.startswith("/") else file_path
    container_dest_path = f"/project/{destination}" if not destination.startswith("/") else destination

    payload = json.dumps(
        {
            "file_path": container_file_path,
            "destination": container_dest_path,
            "email": email,
            "delay": 0,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )

    print(f"\nConectando al backend ({url})...")

    pdf_count = 0
    final_progress = 0
    final_total = 0
    failed_items = []
    try:
        with urllib.request.urlopen(req) as response:
            for line in response:
                decoded = line.decode("utf-8").strip()
                if decoded.startswith("data: "):
                    data_str = decoded[6:]
                    if not data_str:
                        continue
                    try:
                        data = json.loads(data_str)
                        progress = data.get("progress", 0)
                        total = data.get("total", 0)
                        status = data.get("status", "")

                        if status == "downloaded":
                            pdf_count += 1
                        elif status in ("not_found", "failed"):
                            doi = data.get("doi")
                            log_msg = data.get("log", status)
                            if doi and not any(
                                it["doi"] == doi for it in failed_items
                            ):
                                failed_items.append(
                                    {
                                        "doi": doi,
                                        "status": status,
                                        "log": log_msg,
                                    }
                                )
                        
                        final_progress = progress
                        final_total = total

                        # Formato estricto solicitado: "23/78 processed, 15 PDFs"
                        msg = f"{progress}/{total} processed, {pdf_count} PDFs"
                        # Sobrescribimos la línea actual usando \r
                        sys.stdout.write(f"\r{msg}".ljust(60))
                        sys.stdout.flush()
                    except json.JSONDecodeError:
                        pass
                        
            if final_total > 0 and final_progress < final_total:
                print("\n\n[!] Advertencia: La conexión se cerró antes de completar (posible Timeout de Nginx).")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"\n[X] Error del Servidor (HTTP {e.code}):")
        print(f"    Detalle: {error_body}")
    except Exception as e:
        print(f"\n[X] Error de conexión: {e}")
        print("    -> Nginx o el backend no están respondiendo en http://localhost")
        print("    -> Solución: Asegúrate de que el contenedor de Nginx esté corriendo")
        print("       (ej: 'docker-compose up -d').")
        print("    -> Una vez que los contenedores estén arriba, vuelve a ejecutar este script.")

    print("\n\nDescarga finalizada.")
    print("Empaquetando PDFs y reporte de no descargados en archivo .zip...")

    local_dir = Path(destination)
    if not local_dir.is_dir():
        local_dir = Path.cwd() / Path(destination).name

    zip_filename = f"{Path(destination).stem}.zip"
    zip_path = Path.cwd() / zip_filename

    report_lines = [
        "=" * 70,
        "LISTA DE DOCUMENTOS (DOIs) QUE NO SE PUDIERON DESCARGAR",
        f"Total procesados: {final_total}",
        f"Descargados exitosamente: {pdf_count}",
        f"No descargados: {len(failed_items)}",
        "=" * 70,
        "",
    ]
    if failed_items:
        for idx, item in enumerate(failed_items, 1):
            report_lines.append(f"{idx}. DOI: {item['doi']}")
            report_lines.append(f"   Estado: {item['status']}")
            report_lines.append(f"   Detalle: {item['log']}")
            report_lines.append("-" * 50)
    else:
        report_lines.append("¡Todos los documentos fueron descargados con éxito!")

    report_content = "\n".join(report_lines)

    if local_dir.is_dir():
        try:
            (local_dir / "no_descargados.txt").write_text(
                report_content, encoding="utf-8"
            )
        except Exception:
            pass

    pdf_files = list(local_dir.glob("*.pdf")) if local_dir.is_dir() else []

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for pdf in pdf_files:
            zipf.write(pdf, arcname=pdf.name)
        zipf.writestr("no_descargados.txt", report_content)

    print(
        f"\n[✓] Archivo ZIP creado exitosamente: {zip_path.name}\n"
        f"    - {len(pdf_files)} PDFs incluidos\n"
        f"    - no_descargados.txt incluido ({len(failed_items)} no descargados)"
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelado por el usuario.")
        sys.exit(0)
