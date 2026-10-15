#!/usr/bin/env bash
set -euo pipefail
umask 077

MODE="${BACKUP_MODE:-docker}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mandegar}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
UPLOAD_DIR="${UPLOAD_DIR:-/var/lib/mandegar/uploads}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DB_FILE="$BACKUP_DIR/db-$STAMP.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/uploads-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

if [ "$MODE" = "docker" ]; then
  cd "$APP_DIR"
  docker compose exec -T db sh -c 'pg_dump --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
    | gzip -9 > "$DB_FILE.part"
  docker compose exec -T app tar -czf - -C /app --exclude=uploads/.seed-cache uploads > "$UPLOADS_FILE.part"
else
  : "${DATABASE_URL:?DATABASE_URL is required when BACKUP_MODE=host}"
  pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip -9 > "$DB_FILE.part"
  tar -czf "$UPLOADS_FILE.part" -C "$(dirname "$UPLOAD_DIR")" --exclude="$(basename "$UPLOAD_DIR")/.seed-cache" "$(basename "$UPLOAD_DIR")"
fi

gzip -t "$DB_FILE.part"
mv "$DB_FILE.part" "$DB_FILE"
mv "$UPLOADS_FILE.part" "$UPLOADS_FILE"

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) \
  -mmin +"$((RETENTION_DAYS * 1440))" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.part' -mmin +1440 -delete

printf '%s backup ok: %s (%s), %s (%s)\n' "$(date -Iseconds)" \
  "$(basename "$DB_FILE")" "$(du -h "$DB_FILE" | cut -f1)" \
  "$(basename "$UPLOADS_FILE")" "$(du -h "$UPLOADS_FILE" | cut -f1)"
