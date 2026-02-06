#!/bin/sh
set -e

export DATA_DIR="${DATA_DIR:-/data}"

# Run database migrations
pnpm --filter @inventory/server exec prisma migrate deploy

# Start the server
pnpm --filter @inventory/server start
