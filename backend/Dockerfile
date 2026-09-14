FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
# Nota: Creamos un directorio falso o copiamos para que pip pueda estructurar la instalación editable
RUN pip install --no-cache-dir .
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
