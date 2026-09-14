#!/usr/bin/env python3
import os
import sys

def prompt_user(question, default=None, choices=None, shortcut_mapping=None):
    choice_str = f" ({'/'.join(choices)})" if choices else ""
    default_str = f" [{default}]" if default is not None and default != "" else ""

    while True:
        try:
            res = input(f"🔹 {question}{choice_str}{default_str}: ").strip().lower()
            if not res and default is not None:
                if shortcut_mapping and default.lower() in shortcut_mapping:
                    return shortcut_mapping[default.lower()]
                return default.lower()
            if shortcut_mapping and res in shortcut_mapping:
                return shortcut_mapping[res]
            if choices and res in [c.lower() for c in choices]:
                return res
            if choices:
                print(f"❌ Opción inválida. Elige una de estas: {', '.join(choices)}")
                continue
            return res
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Proceso cancelado.")
            sys.exit(0)

def create_file(path, content):
    dirname = os.path.dirname(path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

def main():
    print("="*60)
    print("🚀 GENERADOR PREMIUM DE PROYECTOS (PYTHON + REACT + DOCKER)")
    print("="*60)

    project_name = prompt_user("Nombre del proyecto", default="")
    if not project_name:
        project_name = "mi-proyecto-base"
    project_name = project_name.lower().replace(" ", "-")

    nginx_shortcuts = {"s": "si", "n": "no"}
    use_nginx = prompt_user("¿Incluir Nginx como Proxy Inverso?", default="s", choices=["[S]i", "[N]o"], shortcut_mapping=nginx_shortcuts) == "si"

    db_shortcuts = {"p": "postgres", "s": "sqlite", "n": "ninguna"}
    db_choice = prompt_user("¿Qué Base de Datos deseas?", default="s", choices=["[P]ostgres", "[S]qlite", "[N]inguna"], shortcut_mapping=db_shortcuts)

    db_version = "latest"
    if db_choice == "postgres":
        db_version = prompt_user("Versión de PostgreSQL", default="16")

    print("\n🏗️  Generando estructura de archivos de última generación...")

    # ==========================================
    # 1. GENERACIÓN DEL MAKEFILE
    # ==========================================
    makefile_content = """
.PHONY: up down restart build logs

up:
\tdocker compose up -d --build

down:
\tdocker compose down

restart:
\tdocker compose restart

build:
\tdocker compose build --no-cache

logs:
\tdocker compose logs -f
"""
    create_file("Makefile", makefile_content)

    # ==========================================
    # 2. CONFIGURACIÓN DOCKER COMPOSE
    # ==========================================
    compose_services = {}
    backend_env = ["      - PYTHONDONTWRITEBYTECODE=1", "      - PYTHONUNBUFFERED=1"]
    if db_choice == "postgres":
        backend_env.append("      - DATABASE_URL=postgresql://user:password@db:5432/dbname")

    compose_services["backend"] = f"""
  backend:
    container_name: {project_name}-backend
    build: ./backend
    {"expose:" if use_nginx else "ports:"}
      - {"\"8000\"" if use_nginx else "\"8000:8000\""}
    volumes:
      - ./backend:/app
    environment:
{chr(10).join(backend_env)}
"""
    if db_choice == "postgres":
        compose_services["backend"] += "    depends_on:\n      - db\n"

    compose_services["frontend"] = f"""
  frontend:
    container_name: {project_name}-frontend
    build: ./frontend
    {"expose:" if use_nginx else "ports:"}
      - {"\"5173\"" if use_nginx else "\"5173:5173\""}
    volumes:
      - ./frontend:/app
      - /app/node_modules
"""

    if use_nginx:
        compose_services["nginx"] = f"""
  nginx:
    container_name: {project_name}-nginx
    build: ./nginx
    ports:
      - "80:80"
    depends_on:
      - frontend
      - backend
"""

    if db_choice == "postgres":
        compose_services["db"] = f"""
  db:
    container_name: {project_name}-postgres
    image: postgres:{db_version}-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data
"""

    compose_content = "services:\n" + "".join(compose_services.values())
    if db_choice == "postgres":
        compose_content += "\nvolumes:\n  postgres_data:\n"

    create_file("docker-compose.yml", compose_content)

    # ==========================================
    # 3. BACKEND MODERNO (pyproject.toml)
    # ==========================================
    deps = ['"fastapi>=0.110.0"', '"uvicorn[standard]>=0.28.0"']
    if db_choice == "postgres":
        deps.append('"psycopg2-binary>=2.9.9"')

    pyproject_content = f"""
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "{project_name}-backend"
version = "0.1.0"
description = "Backend de Python configurado dinámicamente"
requires-python = ">=3.11"
dependencies = [
    {",".join(deps)}
]
"""
    create_file("backend/pyproject.toml", pyproject_content)

    cors_middleware = ""
    if not use_nginx:
        cors_middleware = """
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

    main_py_content = f"""
from fastapi import FastAPI
import sys

app = FastAPI()
{cors_middleware}
@app.get("/api/requirements")
def get_requirements():
    return {{
        "python_version": sys.version.split()[0],
        "framework": "FastAPI 0.110.0",
        "database": "{db_choice.upper()} (Versión: {db_version if db_choice == 'postgres' else 'N/A'})",
        "proxy": "Nginx (Puerto 80)" if {use_nginx} else "Directo (Puerto 5173/8000)",
        "status": "¡Entorno moderno con pyproject.toml listo! 🚀"
    }}
"""
    create_file("backend/main.py", main_py_content)

    # El Dockerfile ahora instala usando el pyproject.toml de manera limpia
    create_file("backend/Dockerfile", """
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
# Nota: Creamos un directorio falso o copiamos para que pip pueda estructurar la instalación editable
RUN pip install --no-cache-dir .
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
""")

    # ==========================================
    # 4. FRONTEND CONFIGURATION (React + Vite)
    # ==========================================
    create_file("frontend/package.json", '{\n  "name": "frontend-react",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite --host 0.0.0.0",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.2.1",\n    "vite": "^5.1.4"\n  }\n}')
    create_file("frontend/index.html", '<!doctype html><html lang="es"><head><meta charset="UTF-8" /><title>Dynamic Base</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>')
    create_file("frontend/src/main.jsx", "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>,)")

    fetch_url = "'/api/requirements'" if use_nginx else "'http://localhost:8000/api/requirements'"

    app_jsx_template = """
import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(FETCH_URL_PLACEHOLDER)
      .then(res => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setError(err.message));
  }, []);

  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', color: '#333' },
    card: { border: '1px solid #e1e4e8', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#fff', textAlign: 'left' },
    badge: { backgroundColor: '#e2f5ea', color: '#137333', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' }
  };

  return (
    <div style={styles.container}>
      <h1>¡Proyecto PROJECT_NAME_PLACEHOLDER Inicializado! 🎉</h1>
      <div style={styles.card}>
        <h3>Parámetros Modernos Detectados:</h3>
        {error && <p style={{color: 'red'}}>❌ {error}</p>}
        {!data && !error && <p>Cargando requerimientos...</p>}
        {data && (
          <div>
            <span style={styles.badge}>{data.status}</span>
            <ul>
              <li><strong>Estructura:</strong> PROJECT_NAME_PLACEHOLDER</li>
              <li><strong>Configuración Backend:</strong> pyproject.toml (PEP 621)</li>
              <li><strong>Base de Datos:</strong> {data.database}</li>
              <li><strong>Ruteo/Proxy:</strong> {data.proxy}</li>
              <li><strong>Backend Framework:</strong> Python + {data.framework}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
"""
    app_jsx_content = app_jsx_template.replace("FETCH_URL_PLACEHOLDER", fetch_url).replace("PROJECT_NAME_PLACEHOLDER", project_name)
    create_file("frontend/src/App.jsx", app_jsx_content)
    create_file("frontend/Dockerfile", "FROM node:20-slim\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"run\", \"dev\"]")

    # ==========================================
    # 5. ESCRITURA OPCIONAL DE NGINX
    # ==========================================
    if use_nginx:
        create_file("nginx/nginx.conf", """
server {
    listen 80;
    server_name localhost;
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }
    location / {
        proxy_pass http://frontend:5173;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
""")
        create_file("nginx/Dockerfile", "FROM nginx:alpine\nCOPY nginx.conf /etc/nginx/conf.d/default.conf")

    print("\n" + "="*60)
    print("✅ ¡Estructura profesional generada con éxito!")
    print("👉 El archivo 'pyproject.toml' ha reemplazado a requirements.txt.")
    print("👉 Para encender el entorno de ahora en adelante, simplemente corre:")
    print("   make up")
    print("="*60)

if __name__ == "__main__":
    main()
