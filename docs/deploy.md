# Deploying Mandegar on an Iranian VPS

This guide deploys Mandegar on a fresh Ubuntu 24.04 VPS hosted in Iran. Nothing in the running
stack depends on a foreign service: fonts, scripts, images and the spam challenge are self-hosted,
and every image or package the build needs can come from an Iranian mirror.

## Topology

```
Internet ─▶ (optional ArvanCloud CDN) ─▶ nginx :80/:443
                                          ├─ /uploads/*        served from the uploads volume
                                          ├─ /_next/static/*   proxied once, then cached by nginx
                                          ├─ /_next/image, /og/ proxied once per variant, then cached by nginx
                                          └─ everything else ─▶ app :3000 (Next standalone + Elysia /api)
                                                                 └─▶ db :5432 (PostgreSQL 16)
```

| Service   | Image                            | Role                                                      |
| --------- | -------------------------------- | --------------------------------------------------------- |
| `db`      | `postgres:16-alpine`             | Database, data in the `db-data` volume                    |
| `migrate` | built from `Dockerfile` (tools)  | One-shot `pnpm db:migrate`; also runs the seed on demand  |
| `app`     | built from `Dockerfile` (runner) | `node server.js` as uid 1001, uploads in `uploads` volume |
| `nginx`   | `nginx:1.28-alpine`              | TLS, compression, static caching, rate limits             |

The images are Alpine based. `sharp`, `@node-rs/argon2`, `@resvg/resvg-js` and the Next.js
compiler all ship prebuilt musl binaries, so no glibc compatibility layer is needed, the runtime
image stays small, and the build never runs `apk` (which would need an Alpine mirror).

## 1. Prepare the server

Point the server at an Iranian Ubuntu mirror, for example ArvanCloud:

```bash
sudo sed -i 's#http://[a-z.]*archive.ubuntu.com#https://mirror.arvancloud.ir#g; s#http://security.ubuntu.com#https://mirror.arvancloud.ir#g' \
  /etc/apt/sources.list.d/ubuntu.sources
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw certbot
sudo timedatectl set-timezone Asia/Tehran
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
```

A 2 vCPU / 4 GB server is enough for the site; the production build itself needs about 2 GB of
free memory, so add swap on smaller machines:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile
sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Install Docker through mirrors

The simplest route uses Ubuntu's own packages, which come from the Ubuntu mirror configured above:

```bash
sudo apt install -y docker.io docker-compose-v2 docker-buildx
```

Docker CE works too if your mirror carries the `docker-ce` repository; follow the mirror's
instructions and install `docker-ce docker-ce-cli containerd.io docker-buildx-plugin
docker-compose-plugin`.

Docker Hub is often unreachable or rate limited from Iran. Configure a registry mirror and log
rotation in `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": ["https://docker.arvancloud.ir"],
  "log-driver": "local",
  "log-opts": { "max-size": "20m", "max-file": "5" }
}
```

```bash
sudo systemctl restart docker
docker pull postgres:16-alpine
```

If a mirror does not work as a transparent `registry-mirrors` entry, reference images through it
directly in `.env`, for example `NODE_IMAGE=docker.arvancloud.ir/library/node:22-alpine`,
`POSTGRES_IMAGE=docker.arvancloud.ir/library/postgres:16-alpine` and
`NGINX_IMAGE=docker.arvancloud.ir/library/nginx:1.28-alpine`.

## 3. Get the code and configure it

```bash
sudo mkdir -p /opt/mandegar && sudo chown "$USER" /opt/mandegar
git clone <repository-url> /opt/mandegar
cd /opt/mandegar
cp .env.example .env
chmod 600 .env
```

Edit `.env` (the full reference is at the end of this guide). For production at minimum:

```bash
NEXT_PUBLIC_SITE_URL=https://mandegar.ir
APP_ORIGIN=https://mandegar.ir
SESSION_SECRET=<openssl rand -hex 32>
SEED_OWNER_EMAIL=<owner email>
SEED_OWNER_PASSWORD=<long unique password>
SMS_DRIVER=none
POSTGRES_PASSWORD=<openssl rand -hex 24>
BUILD_DATABASE_URL=postgres://mandegar:<same password>@127.0.0.1:5432/mandegar
NPM_REGISTRY=<npm mirror URL, e.g. https://mirror-npm.runflare.com/>
```

- Use hex passwords: the compose file builds `DATABASE_URL` from `POSTGRES_PASSWORD`, so the
  password must be URL-safe. Keep every value shell-safe too, because `deploy/release.sh` sources
  the file.
- `DATABASE_URL` in `.env` is ignored by the containers; compose points the app at `db:5432`.
- `NEXT_PUBLIC_SITE_URL` is compiled into the build (canonical URLs, sitemaps, Open Graph). Changing
  it requires a rebuild.
- `NPM_REGISTRY` is used for both Corepack (to fetch pnpm) and pnpm. Check the mirror's current URL
  on its website. If Corepack rejects the mirror's signatures, add `COREPACK_INTEGRITY_KEYS=0` as an
  `ENV` in the Dockerfile's base stage.

Replace `mandegar.example` in `deploy/nginx.conf` with your domain (three `server_name` lines and
the two redirect targets).

## 4. TLS certificates

### Let's Encrypt (certbot)

Issue the first certificate before nginx starts, while port 80 is still free. The fixed
`--cert-name` keeps the path that `deploy/nginx.conf` expects:

```bash
sudo certbot certonly --standalone --cert-name mandegar -d mandegar.ir -d www.mandegar.ir \
  -m ops@mandegar.ir --agree-tos --no-eff-email
sudo mkdir -p /var/www/certbot
sudo certbot reconfigure --cert-name mandegar --webroot --webroot-path /var/www/certbot \
  --deploy-hook "docker compose -f /opt/mandegar/docker-compose.yml exec nginx nginx -s reload"
sudo certbot renew --dry-run
```

After `reconfigure`, renewals go through the `/.well-known/acme-challenge/` location that nginx
serves from `/var/www/certbot`, and nginx reloads automatically. The certbot package installs a
systemd timer for renewals.

### ArvanCloud CDN SSL

When the domain is proxied through ArvanCloud CDN, the CDN terminates TLS for visitors. Keep a
certificate on the origin anyway (a Let's Encrypt certificate as above, or an origin certificate
from the CDN panel saved as `/etc/letsencrypt/live/mandegar/{fullchain,privkey}.pem`) and set the
CDN's origin protocol to HTTPS, so traffic between the CDN and the VPS stays encrypted. See the CDN
notes below for the real client IP.

## 5. First deployment

```bash
cd /opt/mandegar
set -a && . ./.env && set +a

docker compose up -d --wait db
docker compose build migrate
docker compose run --rm migrate
docker compose run --rm migrate pnpm db:seed
docker compose build app
docker compose up -d
docker compose ps
```

Why this order: the build prerenders the ISR catalog pages, so it needs a migrated (and ideally
seeded) database. The build reaches PostgreSQL through the host network on `127.0.0.1:5432`, where
compose publishes the `db` port on loopback only. The database URL and the session secret reach the
build as BuildKit secrets (`BUILD_DATABASE_URL` and `SESSION_SECRET` from the environment), so they
never end up in an image layer or in the runtime image's history. Exporting `.env` with `set -a` is
what makes them visible to compose.

The seed is idempotent. Besides the owner account it loads the placeholder catalog and content;
product photos are downloaded from the internet when reachable, and replaced by generated
placeholders otherwise. Replace the placeholder content in the admin before launch.

If your Docker version refuses `network: host` for builds, build the image directly:

```bash
docker build --network host --target runner \
  --secret id=database_url,env=BUILD_DATABASE_URL --secret id=session_secret,env=SESSION_SECRET \
  --build-arg NEXT_PUBLIC_SITE_URL --build-arg NPM_REGISTRY --build-arg NODE_IMAGE \
  -t mandegar-app:latest .
```

Check the deployment:

```bash
curl -fsS https://mandegar.ir/api/health
curl -sI https://mandegar.ir/ | grep -iE 'content-security-policy|strict-transport|x-request-id'
```

## 6. Updates

```bash
cd /opt/mandegar
git pull
bash deploy/release.sh
```

`deploy/release.sh` exports `.env`, starts the database, rebuilds and runs the migrator, rebuilds the
app against the live database, recreates the containers and prunes dangling images. The app is
unavailable for the few seconds it takes the new container to pass its health check; nginx returns
502 during that window.

To roll back, check out the previous commit and run the script again. Migrations are forward only:
take a backup before releasing a migration that drops or rewrites data.

`public/sw.js` is versioned by its `VERSION` constant. Bump it whenever the service worker logic or
the offline pages change; open tabs then show a "new version available" toast with a reload action.

## 7. Backups

`deploy/backup.sh` writes `db-<stamp>.sql.gz` (a plain `pg_dump`) and `uploads-<stamp>.tar.gz` to
`/var/backups/mandegar` and deletes files older than 14 days. Install the cron entry:

```bash
sudo mkdir -p /var/backups/mandegar
sudo cp deploy/backup.cron /etc/cron.d/mandegar-backup
sudo chmod 644 /etc/cron.d/mandegar-backup
sudo /opt/mandegar/deploy/backup.sh
```

Settings come from the environment: `BACKUP_DIR`, `RETENTION_DAYS`, `APP_DIR`, and for hosts
without Docker `BACKUP_MODE=host` with `DATABASE_URL` and `UPLOAD_DIR`.

Keep an off-site copy, for example in ArvanCloud Object Storage with rclone, and encrypt it:

```bash
rclone sync /var/backups/mandegar arvan:mandegar-backups --max-age 48h
```

Restore:

```bash
gunzip -c /var/backups/mandegar/db-20260101-031700.sql.gz \
  | docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose run --rm --no-deps -v /var/backups/mandegar:/backup --user 0 --entrypoint sh app \
  -c 'tar -xzf /backup/uploads-20260101-031700.tar.gz -C /app && chown -R 1001:1001 /app/uploads'
```

Restore into an empty database (recreate the `db-data` volume or drop and recreate the database
first). Test a restore on a scratch server at least once before launch.

## 8. Logs and monitoring

```bash
docker compose logs -f app
docker compose logs -f nginx
docker compose exec nginx tail -f /var/log/nginx/access.log
```

- nginx stamps every request with `X-Request-ID` (`rid=` in the access log), passes it to the app
  and returns it to the client, so a user-reported ID can be traced.
- `GET /api/health` returns 200 with `{ status: "ok", database: true }`, or 503 when the database is
  down. Docker uses it as the container health check; point an uptime monitor at it as well.
- Container logs rotate through the `log-opts` in `daemon.json`.

## 9. Scaling notes

- Scale vertically first. The app is a single Node process; ISR keeps most page views off the
  database, and nginx serves uploads and static assets without touching Node.
- Image optimization (`/_next/image`) and Open Graph cards (`/og/`) are the main CPU costs. nginx
  caches both in the `nginx-cache` volume for 30 days, keyed by URL and, for images, by the format
  the `Accept` header negotiates (AVIF, WebP or the original), so releases and app container
  restarts do not re-encode them. Inspect hits with the `X-Cache-Status` response header.
- Running several app replicas needs a shared ISR cache (a custom `cacheHandler`, for example on
  Redis) and the S3 storage driver for uploads; until then keep one replica.
- Tune PostgreSQL with `shared_buffers` around 25% of RAM via `command: postgres -c ...` on `db` if
  the catalog grows large.

## 10. ArvanCloud CDN notes

- Cache at the edge: `/_next/static/*` and `/uploads/*` are immutable (`max-age=31536000,
immutable`), and so are `/_next/image` results for a given URL.
- HTML pages carry `Cache-Control: s-maxage=3600, stale-while-revalidate=…` from ISR. On-demand
  revalidation after an admin edit refreshes the origin, not the CDN, so either keep HTML out of
  the edge cache (recommended: the origin already serves it from the ISR cache in milliseconds) or
  accept up to an hour of delay and purge the CDN after important edits.
- Bypass the cache for `/api/*` and `/admin/*`. Both send `no-store` or private responses.
- Enable Brotli at the edge; the origin nginx compresses with gzip.
- Restore the visitor IP at the origin, otherwise every visitor shares the CDN's rate-limit
  bucket. Add this to the `http` block of `deploy/nginx.conf`, with one `set_real_ip_from` line per
  range from ArvanCloud's published list of edge IPs:

  ```nginx
  set_real_ip_from 185.143.232.0/22;
  real_ip_header X-Forwarded-For;
  real_ip_recursive on;
  ```

- Keep the WAF and DDoS protection on; the origin's own rate limits remain as a second layer.

## 11. Without Docker (systemd)

1. Install Node.js 22 (from an Iranian mirror of the Node.js binaries or NodeSource packages),
   PostgreSQL 16 and nginx from the Ubuntu mirror.
2. Create the user and directories:

   ```bash
   sudo useradd --system --home /opt/mandegar --shell /usr/sbin/nologin mandegar
   sudo mkdir -p /opt/mandegar /var/lib/mandegar/uploads /etc/mandegar
   sudo chown -R mandegar:mandegar /var/lib/mandegar
   ```

3. Put production variables in `/etc/mandegar/mandegar.env` (mode 600), with
   `DATABASE_URL=postgres://mandegar:<password>@127.0.0.1:5432/mandegar`.
4. Build on the server or in CI, then publish a release directory:

   ```bash
   corepack enable && pnpm install --frozen-lockfile
   set -a && . /etc/mandegar/mandegar.env && set +a
   pnpm db:migrate && pnpm build && pnpm standalone:assemble
   sudo rsync -a --delete .next/standalone/ /opt/mandegar/releases/$(git rev-parse --short HEAD)/
   sudo ln -sfn /opt/mandegar/releases/$(git rev-parse --short HEAD) /opt/mandegar/current
   sudo chown -R mandegar:mandegar /opt/mandegar/releases
   ```

5. Install and start the unit:

   ```bash
   sudo cp deploy/mandegar.service /etc/systemd/system/
   sudo systemctl daemon-reload && sudo systemctl enable --now mandegar
   journalctl -u mandegar -f
   ```

6. Reuse `deploy/nginx.conf` on the host with three changes: `server 127.0.0.1:3000;` instead of
   `server app:3000 resolve;`, remove the `resolver` line, and `root /var/lib/mandegar;` in the
   uploads location (nginx needs read access to `/var/lib/mandegar/uploads`). For Brotli on the host,
   install `libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static` and add
   `brotli on; brotli_static on; brotli_comp_level 5;` with the same types as `gzip_types`.
7. Back up with `BACKUP_MODE=host DATABASE_URL=... UPLOAD_DIR=/var/lib/mandegar/uploads
/opt/mandegar/current/deploy/backup.sh` (copy `deploy/` next to the release, or run it from the
   repository checkout).

## Environment reference

| Variable                             | Required | Default / example                       | Purpose                                                       |
| ------------------------------------ | -------- | --------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`                       | yes      | `postgres://…`                          | PostgreSQL connection (compose builds it from `POSTGRES_*`)   |
| `NEXT_PUBLIC_SITE_URL`               | yes      | `https://mandegar.ir`                   | Public origin; compiled into the build                        |
| `APP_ORIGIN`                         | yes      | `https://mandegar.ir`                   | Only origin allowed for non-GET API requests                  |
| `SESSION_SECRET`                     | yes      | 64 hex characters                       | Signs form tokens, derives ALTCHA keys, hashes client IPs     |
| `UPLOAD_DIR`                         | no       | `uploads` (`/app/uploads` in Docker)    | Local media directory                                         |
| `STORAGE_DRIVER`                     | no       | `local`                                 | `local` or `s3`                                               |
| `S3_ENDPOINT`                        | for s3   | `https://s3.ir-thr-at1.arvanstorage.ir` | S3-compatible endpoint                                        |
| `S3_REGION`                          | no       | `default`                               | S3 region                                                     |
| `S3_BUCKET`                          | for s3   |                                         | Bucket name                                                   |
| `S3_ACCESS_KEY_ID`                   | for s3   |                                         | Access key                                                    |
| `S3_SECRET_ACCESS_KEY`               | for s3   |                                         | Secret key                                                    |
| `ALTCHA_COST`                        | no       | `2000`                                  | Proof-of-work cost                                            |
| `SMS_DRIVER`                         | no       | `console`                               | `console`, `kavenegar` or `none`                              |
| `KAVENEGAR_API_KEY`                  | for sms  |                                         | Kavenegar API key                                             |
| `KAVENEGAR_TEMPLATE_TICKET_RECEIVED` | no       | `mandegar-ticket-received`              | Verify-lookup template for new tickets                        |
| `KAVENEGAR_TEMPLATE_TICKET_UPDATED`  | no       | `mandegar-ticket-updated`               | Verify-lookup template for ticket updates                     |
| `SEED_OWNER_EMAIL`                   | seed     |                                         | Owner account created by the seed                             |
| `SEED_OWNER_PASSWORD`                | seed     | 12+ characters                          | Initial owner password; never overwritten by later seeds      |
| `GOOGLE_SITE_VERIFICATION`           | no       |                                         | Search Console verification token                             |
| `BING_SITE_VERIFICATION`             | no       |                                         | Bing Webmaster verification token                             |
| `INDEXNOW_KEY`                       | no       |                                         | IndexNow key (see docs/seo.md)                                |
| `POSTGRES_USER`                      | compose  | `mandegar`                              | Database user                                                 |
| `POSTGRES_PASSWORD`                  | compose  | hex                                     | Database password                                             |
| `POSTGRES_DB`                        | compose  | `mandegar`                              | Database name                                                 |
| `BUILD_DATABASE_URL`                 | compose  | `postgres://…@127.0.0.1:5432/mandegar`  | Database URL used by the image build through the host network |
| `DB_HOST_PORT`                       | no       | `5432`                                  | Loopback port where compose publishes PostgreSQL              |
| `NPM_REGISTRY`                       | no       | `https://registry.npmjs.org/`           | npm mirror for Corepack and pnpm during the build             |
| `NODE_IMAGE`                         | no       | `node:22-alpine`                        | Base image (set a mirror-prefixed name if needed)             |
| `POSTGRES_IMAGE`                     | no       | `postgres:16-alpine`                    | Database image                                                |
| `NGINX_IMAGE`                        | no       | `nginx:1.28-alpine`                     | nginx image (1.27.3+ is required for `resolve`)               |
| `TLS_DIR`                            | no       | `/etc/letsencrypt`                      | Host directory mounted into nginx for certificates            |
| `ACME_WEBROOT`                       | no       | `/var/www/certbot`                      | Host directory for ACME HTTP-01 challenges                    |

Leave optional variables out instead of setting them to an empty string: empty values fail the
environment validation at startup.
