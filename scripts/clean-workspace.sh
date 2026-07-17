#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
  echo "Error: package.json not found at repo root: $ROOT_DIR"
  exit 1
fi

echo "Cleaning workspace in: $ROOT_DIR"

# Remove dependency directories across all packages/apps.
find "$ROOT_DIR" -type d -name node_modules -prune -exec rm -rf {} +

# Remove common build and tool caches.
find "$ROOT_DIR" -type d \( -name .turbo -o -name .next -o -name .output -o -name dist -o -name build -o -name .cache -o -name coverage \) -prune -exec rm -rf {} +

# Remove file-based caches and build metadata.
find "$ROOT_DIR" -type f \( -name .eslintcache -o -name '*.tsbuildinfo' \) -delete

echo "Workspace cleanup complete."
