#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  printf 'Missing .env; copy .env.example to .env and fill it in first.\n' >&2
  exit 1
fi

set -a
. ./.env
set +a

docker compose up -d --wait db
docker compose build migrate
docker compose run --rm migrate
docker compose build app
docker compose up -d --remove-orphans
docker image prune -f > /dev/null
docker compose ps
