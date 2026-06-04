param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath,

  [string]$DbName = "feedme",
  [string]$DbUser = "feedme",
  [switch]$ConfirmRestore
)

$ErrorActionPreference = "Stop"

if (-not $ConfirmRestore) {
  throw "Restore is destructive. Re-run with -ConfirmRestore after verifying the backup path."
}

if (-not (Test-Path $BackupPath)) {
  throw "Backup file not found: $BackupPath"
}

Get-Content -Raw $BackupPath | docker compose exec -T postgres psql `
  -U $DbUser `
  -d $DbName

Write-Host "Database restored from: $BackupPath"
