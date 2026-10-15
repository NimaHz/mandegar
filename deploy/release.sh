#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-/etc/mandegar/mandegar.env}"
APP_ROOT="${APP_ROOT:-/opt/mandegar}"
APP_USER="${APP_USER:-mandegar}"
SERVICE="${SERVICE:-mandegar}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"

if ! sudo test -r "$ENV_FILE"; then
  printf 'Missing %s; create it from .env.example first (see docs/deploy.md).\n' "$ENV_FILE" >&2
  exit 1
fi

set -a
. <(sudo cat "$ENV_FILE")
set +a

if [ -n "${NPM_REGISTRY:-}" ]; then
  export COREPACK_NPM_REGISTRY="$NPM_REGISTRY" npm_config_registry="$NPM_REGISTRY"
fi
export NEXT_TELEMETRY_DISABLED=1

release="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
target="$APP_ROOT/releases/$release"
previous="$(readlink -f "$APP_ROOT/current" || true)"

switch_to() {
  sudo ln -sfn "$1" "$APP_ROOT/current.next"
  sudo mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
  sudo systemctl restart "$SERVICE"
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

corepack pnpm install --frozen-lockfile --prod=false
corepack pnpm db:migrate
corepack pnpm build
corepack pnpm standalone:assemble

sudo mkdir -p "$target"
sudo rsync -a --delete .next/standalone/ "$target/"
sudo chown -R "$APP_USER:$APP_USER" "$target"
switch_to "$target"

if ! healthy; then
  printf 'Release %s failed its health check (%s).\n' "$release" "$HEALTH_URL" >&2
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    switch_to "$previous"
    printf 'Rolled back to %s.\n' "$(basename "$previous")" >&2
  fi
  exit 1
fi

find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r \
  | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
    if [ "$APP_ROOT/releases/$old" != "$(readlink -f "$APP_ROOT/current")" ]; then
      sudo rm -rf "${APP_ROOT:?}/releases/$old"
    fi
  done

printf 'Released %s\n' "$release"
