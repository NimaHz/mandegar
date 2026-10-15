#!/usr/bin/env bash
set -euo pipefail
umask 077

ENV_FILE="${ENV_FILE:-/etc/mandegar/mandegar.env}"
if [ -z "${DATABASE_URL:-}" ] && [ -r "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL is required; set it or make $ENV_FILE readable}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mandegar}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
UPLOAD_DIR="${UPLOAD_DIR:-/var/lib/mandegar/uploads}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DB_FILE="$BACKUP_DIR/db-$STAMP.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/uploads-$STAMP.tar.gz"

case "$UPLOAD_DIR" in
  /*) ;;
  *)
    printf 'UPLOAD_DIR must be an absolute path, got %s\n' "$UPLOAD_DIR" >&2
    exit 1
    ;;
esac

mkdir -p "$BACKUP_DIR"

pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip -9 > "$DB_FILE.part"
tar -czf "$UPLOADS_FILE.part" -C "$(dirname "$UPLOAD_DIR")" \
  --exclude="$(basename "$UPLOAD_DIR")/.seed-cache" "$(basename "$UPLOAD_DIR")"

gzip -t "$DB_FILE.part"
mv "$DB_FILE.part" "$DB_FILE"
mv "$UPLOADS_FILE.part" "$UPLOADS_FILE"

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) \
  -mmin +"$((RETENTION_DAYS * 1440))" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.part' -mmin +1440 -delete

printf '%s backup ok: %s (%s), %s (%s)\n' "$(date -Iseconds)" \
  "$(basename "$DB_FILE")" "$(du -h "$DB_FILE" | cut -f1)" \
  "$(basename "$UPLOADS_FILE")" "$(du -h "$UPLOADS_FILE" | cut -f1)"
