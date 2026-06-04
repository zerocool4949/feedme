#!/usr/bin/env bash
set -e

export COMPOSE_PROJECT_NAME=feedme-dev
DB_URL="postgresql://feedme:feedme_password@localhost:5433/feedme?schema=public"

echo "Starting Postgres..."
docker compose up postgres -d > /dev/null

echo "Waiting for Postgres to be healthy..."
retries=20
while [ $retries -gt 0 ]; do
  health=$(docker inspect --format "{{.State.Health.Status}}" feedme-dev-postgres-1 2>/dev/null || true)
  [ "$health" = "healthy" ] && break
  sleep 2
  retries=$((retries - 1))
done
[ $retries -eq 0 ] && { echo "Postgres did not become healthy in time."; exit 1; }

echo "Running migrations..."
export DATABASE_URL="$DB_URL"
(cd backend && npx prisma migrate deploy && npx prisma generate)

echo "Starting backend..."
DATABASE_URL="$DB_URL" PORT=3000 npm --prefix backend run start:dev &

echo "Starting frontend..."
npm --prefix frontend run dev -- --host &

echo "Done. Frontend: http://localhost:5173  Backend: http://localhost:3000"
wait
