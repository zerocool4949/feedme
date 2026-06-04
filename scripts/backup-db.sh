#!/usr/bin/env bash
set -e

OUTPUT_DIR="${1:-backups}"
DB_NAME="${2:-feedme}"
DB_USER="${3:-feedme}"

mkdir -p "$OUTPUT_DIR"

timestamp=$(date +"%Y%m%d-%H%M%S")
backup_path="$OUTPUT_DIR/feedme-$timestamp.sql"

docker compose exec -T postgres pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$backup_path"

echo "Backup created: $backup_path"
