FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt \
    && addgroup --system app \
    && adduser --system --ingroup app app

COPY --chown=app:app app ./app

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import os; from urllib.request import urlopen; urlopen('http://127.0.0.1:%s/api/salud' % os.environ.get('PORT','8000'), timeout=2).read()"

# Render inyecta PORT; en Docker Compose se usa 8000.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
