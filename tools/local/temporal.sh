#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p .local/state
if [[ ! -x .local/bin/temporal ]]; then
  echo 'Install the official Temporal CLI at .local/bin/temporal or use a local Temporal service.' >&2
  exit 1
fi
exec .local/bin/temporal server start-dev --ip 127.0.0.1 --port 7233 --ui-ip 127.0.0.1 --ui-port 8233 --db-filename .local/state/temporal.db
