from fastapi import FastAPI
import sys

app = FastAPI()

@app.get("/api/requirements")
def get_requirements():
    return {
        "python_version": sys.version.split()[0],
        "framework": "FastAPI 0.110.0",
        "database": "POSTGRES (Versión: 16)",
        "proxy": "Nginx (Puerto 80)" if True else "Directo (Puerto 5173/8000)",
        "status": "¡Entorno moderno con pyproject.toml listo! 🚀"
    }
