param(
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

if (-not $env:DOCKER_CONTEXT) { $env:DOCKER_CONTEXT = "nuc" }

$Branch = (git rev-parse --abbrev-ref HEAD).Trim()
$Sha = (git rev-parse HEAD).Trim()
if (-not $Sha) { throw "Could not resolve git HEAD" }
$RepoRoot = (git rev-parse --show-toplevel).Trim()

function Build-AndPush {
  param([string]$Name, [string]$Context)

  $Image = "ghcr.io/zerocool4949/$Name"
  Write-Host "Building $Image (tags: $Branch, sha-$Sha) on docker context '$($env:DOCKER_CONTEXT)'..."
  docker build -t "${Image}:$Branch" -t "${Image}:sha-$Sha" $Context
  if ($LASTEXITCODE -ne 0) { throw "docker build failed for $Name" }

  if (-not $NoPush) {
    Write-Host "Pushing $Image..."
    docker push "${Image}:$Branch"
    if ($LASTEXITCODE -ne 0) { throw "docker push $Branch failed for $Name" }
    docker push "${Image}:sha-$Sha"
    if ($LASTEXITCODE -ne 0) { throw "docker push sha-$Sha failed for $Name" }

    # Drop the local per-commit tag now that it's pushed; keep only the
    # branch tag locally so tags don't pile up on every commit.
    docker rmi "${Image}:sha-$Sha" | Out-Null
  }
}

Build-AndPush -Name "feedme-backend" -Context (Join-Path $RepoRoot "backend")
Build-AndPush -Name "feedme-frontend" -Context (Join-Path $RepoRoot "frontend")

# Remove dangling images left behind when a branch tag gets reassigned.
docker image prune -f | Out-Null

Write-Host "Done."
