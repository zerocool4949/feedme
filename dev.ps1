$ErrorActionPreference = "Stop"

$DB_URL = "postgresql://feedme:feedme_password@localhost:5432/feedme?schema=public"
$DOCKER = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

Write-Host "Starting Postgres..." -ForegroundColor Cyan
& $DOCKER compose up postgres -d | Out-Null

Write-Host "Waiting for Postgres to be healthy..." -ForegroundColor Cyan
$retries = 20
while ($retries -gt 0) {
    $health = & $DOCKER inspect --format "{{.State.Health.Status}}" feedme-postgres-1 2>$null
    if ($health -eq "healthy") { break }
    Start-Sleep -Seconds 2
    $retries--
}
if ($retries -eq 0) { Write-Error "Postgres did not become healthy in time."; exit 1 }

Write-Host "Running migrations..." -ForegroundColor Cyan
$env:DATABASE_URL = $DB_URL
Push-Location backend
npx prisma migrate deploy
npx prisma generate
Pop-Location

Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd `"$PWD\backend`"; `$env:DATABASE_URL = `"$DB_URL`"; `$env:PORT = `"3000`"; npm run start:dev"

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd `"$PWD\frontend`"; npm run dev"

Write-Host "Done. Frontend: http://localhost:5173  Backend: http://localhost:3000" -ForegroundColor Green
