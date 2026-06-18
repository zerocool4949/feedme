#!/usr/bin/env bash
set -e

DB_NAME="${1:-feedme}"
DB_USER="${2:-feedme}"

echo "WARNING: This will overwrite the DEV database with production data. Press Ctrl+C to cancel, or Enter to continue."
read -r

tmpfile=$(mktemp /tmp/feedme-prod-dump-XXXXXX.sql)
trap 'rm -f "$tmpfile"' EXIT

echo "Dumping production database..."
docker compose exec -T postgres pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$tmpfile"

echo "Ensuring dev postgres is running..."
COMPOSE_PROJECT_NAME=feedme-dev docker compose up postgres -d > /dev/null

echo "Waiting for dev postgres to be healthy..."
retries=20
while [ $retries -gt 0 ]; do
  health=$(docker inspect --format "{{.State.Health.Status}}" feedme-dev-postgres-1 2>/dev/null || true)
  [ "$health" = "healthy" ] && break
  sleep 2
  retries=$((retries - 1))
done
[ $retries -eq 0 ] && { echo "Dev postgres did not become healthy in time."; exit 1; }

echo "Restoring into dev database..."
COMPOSE_PROJECT_NAME=feedme-dev docker compose exec -T postgres psql \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  < "$tmpfile"

echo "Done. Production data is now in the dev database."
