#!/usr/bin/env bash
set -e

echo "Waiting for database..."

python - <<'PY'
import os
import time
import psycopg2

for i in range(30):
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "db"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"],
            dbname=os.environ["POSTGRES_DB"],
        )
        conn.close()
        print("Database is ready")
        break
    except Exception as e:
        print(f"DB not ready yet: {e}")
        time.sleep(2)
else:
    raise SystemExit("Database did not become ready in time")
PY

alembic upgrade head
exec uvicorn main:app --host 0.0.0.0 --port 8000
