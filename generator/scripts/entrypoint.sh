#!/bin/sh
set -e

echo "[entrypoint] Running initial generation check..."
# Run the generator. It handles idempotency (won't overwrite if exists).
# We do NOT pass --force here.
node src/index.js

echo "[entrypoint] Starting scheduler..."
exec supercronic /app/crontab
