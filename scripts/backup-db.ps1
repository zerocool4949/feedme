param(
  [string]$OutputDir = "backups",
  [string]$DbName = "feedme",
  [string]$DbUser = "feedme"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDir "feedme-$timestamp.sql"

docker compose exec -T postgres pg_dump `
  -U $DbUser `
  -d $DbName `
  --clean `
  --if-exists `
  --no-owner `
  --no-privileges `
  | Set-Content -Encoding UTF8 $backupPath

Write-Host "Backup created: $backupPath"
