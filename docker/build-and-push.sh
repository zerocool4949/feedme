#!/usr/bin/env bash
set -euo pipefail

export DOCKER_CONTEXT="${DOCKER_CONTEXT:-nuc}"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SHA="$(git rev-parse HEAD)"
NO_PUSH="${1:-}"

repo_root="$(git rev-parse --show-toplevel)"

build_and_push() {
  local name="$1" context="$2"
  local image="ghcr.io/zerocool4949/${name}"

  echo "Building ${image} (tags: ${BRANCH}, sha-${SHA}) on docker context '${DOCKER_CONTEXT}'..."
  docker build -t "${image}:${BRANCH}" -t "${image}:sha-${SHA}" "${context}"

  if [ "$NO_PUSH" != "--no-push" ]; then
    echo "Pushing ${image}..."
    docker push "${image}:${BRANCH}"
    docker push "${image}:sha-${SHA}"

    # Drop the local per-commit tag now that it's pushed; keep only the
    # branch tag locally so tags don't pile up on every commit.
    docker rmi "${image}:sha-${SHA}" >/dev/null
  fi
}

build_and_push feedme-backend "${repo_root}/backend"
build_and_push feedme-frontend "${repo_root}/frontend"

# Remove dangling images left behind when a branch tag gets reassigned.
docker image prune -f >/dev/null

echo "Done."
