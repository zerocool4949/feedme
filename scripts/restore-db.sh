#!/usr/bin/env bash
set -e

BACKUP_PATH="${1:-}"
DB_NAME="${2:-feedme}"
DB_USER="${3:-feedme}"

if [ -z "$BACKUP_PATH" ]; then
  echo "Usage: $0 <backup-file> [db-name] [db-user]"
  exit 1
fi

if [ ! -f "$BACKUP_PATH" ]; then
  echo "Backup file not found: $BACKUP_PATH"
  exit 1
fi

echo "WARNING: This will overwrite the database '$DB_NAME'. Press Ctrl+C to cancel, or Enter to continue."
read -r

docker compose exec -T postgres psql \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  < "$BACKUP_PATH"

echo "Database restored from: $BACKUP_PATH"
