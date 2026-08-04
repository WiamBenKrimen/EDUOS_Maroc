FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN groupadd --system eduos \
    && useradd --system --gid eduos --home-dir /app eduos

COPY pyproject.toml README.md alembic.ini ./
COPY src ./src
COPY migrations ./migrations
COPY database ./database

RUN python -m pip install --upgrade pip \
    && python -m pip install .

USER eduos

EXPOSE 3001

CMD ["python", "-m", "uvicorn", "eduos.main:app", "--host", "0.0.0.0", "--port", "3001"]
