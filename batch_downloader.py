import urllib.request
import json
import sys


def main():
    print("=== Local File Batch Downloader ===")
    file_path = input("Path del .bib: ").strip()
    destination = input("Folder name: ").strip()
    email = input("Correo: ").strip()

    url = "http://localhost:8000/api/bibliography/batch-download-local"
    payload = json.dumps(
        {
            "file_path": file_path,
            "destination": destination,
            "email": email,
            "delay": 2,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )

    print(f"\nConectando al backend ({url})...")

    pdf_count = 0
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

                        # Formato estricto solicitado: "23/78 processed, 15 PDFs"
                        msg = f"{progress}/{total} processed, {pdf_count} PDFs"
                        # Sobrescribimos la línea actual usando \r
                        sys.stdout.write(f"\r{msg}".ljust(60))
                        sys.stdout.flush()
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        print(f"\n[X] Error de conexión: {e}")
        print("    -> El backend de FastAPI no está respondiendo en http://localhost:8000")
        print("    -> Solución: Abre OTRA pestaña en tu terminal y levanta el servidor backend")
        print("       (ej: 'docker-compose up' o 'uvicorn backend.main:app --port 8000').")
        print("    -> Una vez que el backend esté corriendo, vuelve a ejecutar este script.")

    print("\n\nDescarga finalizada.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelado por el usuario.")
        sys.exit(0)