#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-/etc/mandegar/mandegar.env}"
APP_ROOT="${APP_ROOT:-/opt/mandegar}"
APP_USER="${APP_USER:-mandegar}"
SERVICE="${SERVICE:-mandegar}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"

if [ "$(id -u)" -eq 0 ]; then
  printf 'Run this as the deploy user, not as root; it asks for sudo only when it needs it.\n' >&2
  exit 1
fi

if ! sudo test -r "$ENV_FILE"; then
  printf 'Missing %s; create it from .env.example first (see docs/deploy.md).\n' "$ENV_FILE" >&2
  exit 1
fi

env_content="$(sudo cat "$ENV_FILE")"
sudo -k

env_value() {
  printf '%s\n' "$env_content" | sed -n "s/^$1=//p" | tail -n 1
}

registry="$(env_value NPM_REGISTRY)"
integrity_keys="$(env_value COREPACK_INTEGRITY_KEYS)"

install_env=(NEXT_TELEMETRY_DISABLED=1)
for name in HOME PATH LANG LC_ALL TMPDIR COREPACK_HOME NODE_EXTRA_CA_CERTS \
  HTTP_PROXY HTTPS_PROXY NO_PROXY http_proxy https_proxy no_proxy; do
  if [ -n "${!name:-}" ]; then
    install_env+=("$name=${!name}")
  fi
done
if [ -n "$registry" ]; then
  install_env+=("COREPACK_NPM_REGISTRY=$registry" "pnpm_config_registry=$registry")
fi
if [ -n "$integrity_keys" ]; then
  install_env+=("COREPACK_INTEGRITY_KEYS=$integrity_keys")
fi

release="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
target="$APP_ROOT/releases/$release"
previous="$(readlink -e "$APP_ROOT/current" || true)"
case "$previous" in
  "$APP_ROOT"/releases/*) ;;
  *) previous="" ;;
esac

switch_to() {
  sudo ln -sfn "$1" "$APP_ROOT/current.next"
  sudo mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
  sudo systemctl restart "$SERVICE" || true
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fs -o /dev/null --max-time 5 "$HEALTH_URL"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

env -i "${install_env[@]}" corepack pnpm install --frozen-lockfile --prod=false

set -a
. <(printf '%s\n' "$env_content")
set +a
export "${install_env[@]}"

corepack pnpm db:migrate
corepack pnpm build
corepack pnpm standalone:assemble

sudo mkdir -p "$target"
sudo rsync -a --delete .next/standalone/ "$target/"
sudo chown -R "$APP_USER:$APP_USER" "$target"
switch_to "$target"

if ! healthy; then
  printf 'Release %s failed its health check (%s).\n' "$release" "$HEALTH_URL" >&2
  if [ -n "$previous" ] && [ "$previous" != "$target" ]; then
    switch_to "$previous"
    sudo rm -rf "$target"
    printf 'Rolled back to %s.\n' "$(basename "$previous")" >&2
  else
    printf 'No previous release to roll back to; %s stays live.\n' "$release" >&2
  fi
  exit 1
fi

live="$(readlink -e "$APP_ROOT/current")"
find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r \
  | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
    if [ "$APP_ROOT/releases/$old" != "$live" ]; then
      sudo rm -rf "${APP_ROOT:?}/releases/$old"
    fi
  done

printf 'Released %s\n' "$release"
