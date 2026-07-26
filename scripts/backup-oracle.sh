#!/bin/sh
set -e
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
COMPOSE="docker compose -f docker-compose.oracle.yml --env-file .env"

echo "Database dump..."
$COMPOSE exec -T db pg_dump -U "${DB_USER:-biruk}" "${DB_NAME:-biruk_academy}" > "backups/db-${STAMP}.sql"

echo "Media archive..."
$COMPOSE exec -T backend tar czf - -C /app/media . > "backups/media-${STAMP}.tar.gz"

echo "Done: backups/db-${STAMP}.sql and backups/media-${STAMP}.tar.gz"
