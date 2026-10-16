# Deploying Mandegar on an Iranian VPS

This guide deploys Mandegar on a fresh Ubuntu 24.04 VPS hosted in Iran, directly on the host:
PostgreSQL and nginx from Ubuntu packages, and the Next.js standalone server under systemd.
Nothing in the running stack depends on a foreign service: fonts, scripts, images and the spam
challenge are self-hosted, and every package the build needs can come from an Iranian mirror.

## Topology

```
Internet ─▶ (optional ArvanCloud CDN) ─▶ nginx :80/:443
                                          ├─ /uploads/*        served from /var/lib/mandegar/uploads
                                          ├─ /_next/static/*   proxied once, then cached by nginx
                                          ├─ /_next/image, /og/ proxied once per variant, then cached by nginx
                                          └─ everything else ─▶ mandegar.service, localhost:3000
                                                                 (Next standalone + Elysia /api)
                                                                 └─▶ PostgreSQL 16, 127.0.0.1:5432
```

| Path                               | Owner       | Contents                                                |
| ---------------------------------- | ----------- | ------------------------------------------------------- |
| `/opt/mandegar/source`             | deploy user | Git checkout; releases are built here                   |
| `/opt/mandegar/releases/<release>` | `mandegar`  | One built standalone server per release                 |
| `/opt/mandegar/current`            | `root`      | Symlink to the live release; the systemd unit runs here |
| `/etc/mandegar/mandegar.env`       | `root`, 600 | Production environment                                  |
| `/var/lib/mandegar/uploads`        | `mandegar`  | Uploaded media, served by nginx                         |
| `/var/backups/mandegar`            | `root`, 700 | Nightly database dumps and uploads archives             |
| `/var/cache/nginx`                 | `www-data`  | nginx cache for static assets, images and share cards   |

The deploy user is your own sudo-capable account. It builds releases without root and uses `sudo`
only to read the environment file, publish a release and restart the service.

## 1. Prepare the server

Point the server at an Iranian Ubuntu mirror, for example ArvanCloud:

```bash
sudo sed -i 's#http://[a-z.]*archive.ubuntu.com#https://mirror.arvancloud.ir#g; s#http://security.ubuntu.com#https://mirror.arvancloud.ir#g' \
  /etc/apt/sources.list.d/ubuntu.sources
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl rsync ufw certbot nginx postgresql rclone
sudo timedatectl set-timezone Asia/Tehran
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
```

A 2 vCPU / 4 GB server is enough for the site; the production build itself needs about 2 GB of
free memory, so add swap on smaller machines:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile
sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Install Node.js

The app needs Node.js 22.13 or newer (the pinned pnpm 11 refuses older 22.x releases); `.nvmrc`
pins 24, the current LTS. Ubuntu 24.04's own `nodejs` package is too old, so install the official
Linux build. `NODE_DIST` is the download base: keep `https://nodejs.org/dist` when it is reachable,
or point it at any mirror of that directory.

```bash
NODE_VERSION=v24.22.0
NODE_DIST=https://nodejs.org/dist
curl -fsSLO "$NODE_DIST/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz"
curl -fsSL "$NODE_DIST/$NODE_VERSION/SHASUMS256.txt" | grep " node-$NODE_VERSION-linux-x64.tar.xz\$" | sha256sum -c -
sudo tar -xJf "node-$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 --no-same-owner
node -v && corepack --version
```

Pick the newest `v24` release listed under `$NODE_DIST`. When `NODE_DIST` is a mirror, the checksum
file comes from the same mirror, so also compare the tarball's SHA-256 (`sha256sum node-*.tar.xz`)
with `https://nodejs.org/dist/<version>/SHASUMS256.txt` fetched over another network.

The release script runs pnpm through Corepack, which downloads the pnpm version pinned in
`package.json` the first time and checks it against the SHA-512 pinned there, so a mirror cannot
substitute a different pnpm.

## 3. Database

Create the role and database with a hex password (it goes into a URL, so it must be URL-safe):

```bash
DB_PASSWORD="$(openssl rand -hex 24)"
printf "CREATE ROLE mandegar LOGIN PASSWORD '%s';\n" "$DB_PASSWORD" | sudo -u postgres psql -v ON_ERROR_STOP=1
sudo -u postgres createdb --owner mandegar mandegar
echo "$DB_PASSWORD"
```

Keep the password for the environment file below; piping the SQL keeps it out of the process list.
PostgreSQL listens on localhost only by default.
The migrations enable `pg_trgm`, a trusted extension that the database owner can create without
superuser rights.

## 4. Service user and directories

```bash
sudo useradd --system --home-dir /opt/mandegar --no-create-home --shell /usr/sbin/nologin mandegar
sudo install -d -o "$USER" -g "$USER" /opt/mandegar/source
sudo install -d /opt/mandegar/releases /etc/mandegar
sudo install -d -o mandegar -g mandegar /var/lib/mandegar
sudo install -d -o "$USER" -g mandegar /var/lib/mandegar/uploads
sudo install -d -m 700 /var/backups/mandegar
```

The uploads directory belongs to you until the first seed has written its media; step 8 hands it to
`mandegar`.

## 5. Get the code and configure it

```bash
git clone <repository-url> /opt/mandegar/source
cd /opt/mandegar/source
sudo install -m 600 .env.example /etc/mandegar/mandegar.env
sudoedit /etc/mandegar/mandegar.env
```

The full reference is at the end of this guide. For production at minimum:

```bash
DATABASE_URL=postgres://mandegar:<DB_PASSWORD>@127.0.0.1:5432/mandegar
NEXT_PUBLIC_SITE_URL=https://mandegar.ir
APP_ORIGIN=https://mandegar.ir
SESSION_SECRET=<openssl rand -hex 32>
UPLOAD_DIR=/var/lib/mandegar/uploads
SEED_OWNER_EMAIL=<owner email>
SEED_OWNER_PASSWORD=<long unique password>
SMS_DRIVER=none
NPM_REGISTRY=<npm mirror URL, e.g. https://mirror-npm.runflare.com/>
```

- `deploy/release.sh` and `deploy/backup.sh` source this file and systemd reads it as well, so keep
  every value on one line, unquoted and shell-safe.
- `UPLOAD_DIR` must be the absolute path above; the unit does not set it. Values in the file
  override the unit's own `Environment=` lines, so do not set `HOSTNAME`, `PORT` or `NODE_ENV` here.
- `.env.example` leaves `NEXT_PUBLIC_SITE_URL`, `APP_ORIGIN` and `UPLOAD_DIR` blank. In production
  they have no defaults: `/api/health` fails, and the release script rolls back, until both URLs
  are the same `https://` origin, `UPLOAD_DIR` is an absolute path, and `NEXT_PUBLIC_SITE_URL`
  equals the value the running release was built with (see the environment reference).
- `NEXT_PUBLIC_SITE_URL` is compiled into the build (canonical URLs, sitemaps, Open Graph). Changing
  it requires a new release.
- `NPM_REGISTRY` is used only by the release script, for Corepack (to fetch pnpm) and pnpm (as
  `pnpm_config_registry`; pnpm 11 ignores `npm_config_registry`). Check the mirror's current URL on
  its website. If Corepack rejects the mirror's npm signatures, also add `COREPACK_INTEGRITY_KEYS=0`;
  the SHA-512 pin in `package.json` still guarantees the exact pnpm build.

## 6. TLS certificates

### Let's Encrypt (certbot)

Issue the first certificate while port 80 is still free. The fixed `--cert-name` keeps the path that
`deploy/nginx.conf` expects:

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone --cert-name mandegar -d mandegar.ir -d www.mandegar.ir \
  -m ops@mandegar.ir --agree-tos --no-eff-email
```

Renewals switch to the webroot that nginx serves once nginx is running with the new config, at the
end of the next step.

### ArvanCloud CDN SSL

When the domain is proxied through ArvanCloud CDN, the CDN terminates TLS for visitors. Keep a
certificate on the origin anyway (a Let's Encrypt certificate as above, or an origin certificate
from the CDN panel saved as `/etc/letsencrypt/live/mandegar/{fullchain,privkey}.pem`) and set the
CDN's origin protocol to HTTPS, so traffic between the CDN and the VPS stays encrypted. See the CDN
notes below for the real client IP.

## 7. nginx

`deploy/nginx.conf` is a complete `nginx.conf` for Ubuntu's nginx package. Install it with your
domain in place of `mandegar.example`, without editing the checkout (so `git pull` stays clean):

```bash
cd /opt/mandegar/source
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.ubuntu
sudo install -d -o www-data -g www-data -m 700 /var/cache/nginx
sudo install -d /var/www/certbot
sed 's/mandegar\.example/mandegar.ir/g' deploy/nginx.conf | sudo tee /etc/nginx/nginx.conf > /dev/null
sudo nginx -t && sudo systemctl enable --now nginx && sudo systemctl reload nginx
```

Then move certificate renewals to the webroot. `reconfigure` runs a test renewal through nginx,
which is why it comes after nginx is up; answer yes when it asks whether to run the deploy hook:

```bash
sudo certbot reconfigure --cert-name mandegar --webroot --webroot-path /var/www/certbot \
  --deploy-hook "systemctl reload nginx"
sudo certbot renew --dry-run
```

The certbot package installs a systemd timer for renewals, and nginx reloads after each one. Repeat
the `sed | tee` line after a `git pull` that changes `deploy/nginx.conf`.

It replaces Ubuntu's default site, so `/etc/nginx/sites-enabled` is no longer read. nginx runs as
`www-data` and serves `/uploads/*` straight from `/var/lib/mandegar/uploads`, where the app writes
public media world-readable and ticket attachments under `private/` readable by `mandegar` only. A
public upload that is not on disk falls through to the app (`location @uploads`), which is how
media is served with `STORAGE_DRIVER=s3`: the app streams it from the bucket.

For Brotli, install `libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static` (the config
already loads enabled modules) and add `brotli on; brotli_static on; brotli_comp_level 5;` to the
`http` block with the same types as `gzip_types`.

## 8. First release

```bash
cd /opt/mandegar/source
registry="$(sudo sed -n 's/^NPM_REGISTRY=//p' /etc/mandegar/mandegar.env)"
integrity_keys="$(sudo sed -n 's/^COREPACK_INTEGRITY_KEYS=//p' /etc/mandegar/mandegar.env)"
env ${integrity_keys:+COREPACK_INTEGRITY_KEYS="$integrity_keys"} \
  COREPACK_NPM_REGISTRY="${registry:-https://registry.npmjs.org/}" \
  pnpm_config_registry="${registry:-https://registry.npmjs.org/}" \
  corepack pnpm install --frozen-lockfile --prod=false
set -a && . <(sudo cat /etc/mandegar/mandegar.env) && set +a
corepack pnpm db:migrate
corepack pnpm db:seed
sudo chown -R mandegar:mandegar /var/lib/mandegar/uploads
sudo install -d -o mandegar -g mandegar -m 700 /var/lib/mandegar/uploads/private
sudo chmod -R go-rwx /var/lib/mandegar/uploads/private

sudo cp deploy/mandegar.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable mandegar
bash deploy/release.sh
```

Dependencies are installed before the environment file is loaded, so package install scripts never
see the production secrets. `COREPACK_INTEGRITY_KEYS` is passed only when the environment file sets
it, as the release script does.

The seed is idempotent. In production it creates the owner account, the two warranty policies and
the site settings, and nothing else. To start from placeholder content instead of an empty site,
run it as `SEED_DEMO=true corepack pnpm db:seed`: that adds four brands, six categories, 18
products with photos and manuals, guides with Aparat video hashes that do not exist, blog posts
and authors, hero slides, FAQs and service centres, all published. Product photos are downloaded
from the internet when reachable and replaced by generated placeholders otherwise. Demo warranty
codes and support tickets are seeded only on a local stack (`APP_ORIGIN` on `localhost` and
`NODE_ENV` not `production`), never on a server, so the placeholder products stay deletable.
Replace or delete every placeholder in the admin before launch: archive or delete products,
categories, brands, guides, posts, slides, FAQs and service centres, and edit the settings, which
start with placeholder company details, contact details and statistics.

Content is only seeded into tables that are still empty, so a later run never overwrites,
republishes or restores anything edited, archived or deleted in the admin, unless every row of a
table was deleted: that table gets its placeholders again. To run it again later, run it as the
`mandegar` user with the environment file loaded, so the media it writes belong to the service:

```bash
cd /opt/mandegar/source
sudo bash -c 'set -a && . /etc/mandegar/mandegar.env && set +a && export SEED_DEMO=true &&
  exec runuser -u mandegar -- node_modules/.bin/tsx --conditions=react-server src/server/db/seed.ts'
```

Leave out `export SEED_DEMO=true &&` to create only the owner, policies and settings.

The unit binds to `localhost`, not `127.0.0.1`. Next.js reports loopback hosts as `localhost`
inside the proxy, so with a `127.0.0.1` bind its locale rewrites no longer match the server origin
and Persian pages answer with a 308 loop, or a 500 behind nginx. The unit also sets
`NODE_OPTIONS=--dns-result-order=ipv4first`, so `localhost` resolves to `127.0.0.1`, the address the
nginx upstream connects to, even on images whose `/etc/hosts` lists `::1 localhost` first.

Check the deployment:

```bash
systemctl status mandegar --no-pager
curl -fsS https://mandegar.ir/api/health
curl -sI https://mandegar.ir/ | grep -iE 'content-security-policy|strict-transport|x-request-id'
```

## 9. Updates and rollback

```bash
cd /opt/mandegar/source
git pull
bash deploy/release.sh
```

Run it as the deploy user; it refuses to run as root. `deploy/release.sh` reads the environment file
once and drops the cached sudo credentials, installs dependencies with a minimal environment (no
production secrets), then loads the environment, applies migrations and builds against the live
database (the build prerenders the ISR catalog pages). It copies the standalone server into a new
`/opt/mandegar/releases/<date>-<commit>` directory, asks for sudo again to publish it, switches the
`current` symlink, restarts the service and waits for `http://127.0.0.1:3000/api/health`, the
address nginx uses. If the migrations or the build fail, it stops before switching; the migrations
run in one transaction, so a failed one leaves the schema as it was, while a failed build leaves the
live release on the migrated schema. If the new release does not become healthy within a minute, it
switches back to the previous release, deletes the failed one and exits with an error. It keeps the
five newest releases (`KEEP_RELEASES`). The site is unavailable for the few seconds the restart
takes; nginx answers 502 during that window and keeps serving cached static assets.

Edits made in the admin while a release builds, or before any restart, reach the new process. The
production cache handler (`src/server/cache-handler.mjs`) extends Next.js's file-system ISR cache
and stores every cache-tag expiry in the `cache_tag_expirations` table; each process loads them
before it serves a cached page or data entry, so pages prerendered by the build, or rendered before
a restart, are rendered again when an edit expired one of their tags. If the table cannot be read,
the app logs `Could not load cache tag expirations`, serves the cache as it is and retries after
30 seconds.

To roll back by hand, point `current` at an older release and restart:

```bash
ls /opt/mandegar/releases
sudo ln -sfn /opt/mandegar/releases/<release> /opt/mandegar/current
sudo systemctl restart mandegar
```

`public/sw.js` is versioned by its `VERSION` constant. `deploy/release.sh` stamps the release id into
it, so every release installs a new worker that precaches that release's offline pages and their
assets and drops the previous release's caches; open tabs then show a "new version available" toast
with a reload action. Bump the constant in the source when the service worker logic changes.

### Migrations and rollback

Migrations are forward only, and `deploy/release.sh` applies them before the build, because the
build prerenders pages with the new code and every query names each column of the schema. The live
release therefore runs against the new schema while the new one builds, and keeps running on it
when the build fails or the health check switches back. Neither the automatic rollback nor a manual
one reverts a migration, so every schema change follows the expand/contract rule:

- **Expand.** A release only adds what the live release ignores (a table, a nullable or defaulted
  column, an index) or rewrites data into a shape the live release already reads. The code that
  uses the addition ships in the same release.
- **Contract.** Dropping a column or table, renaming one or changing its type ships in a later
  release than the code that stops reading the old shape, once no release that still reads it will
  be rolled back to.

A rollback is safe when every migration since the target release was an expansion: switch `current`
as above. Migration `0004_policy_name_localized` breaks the rule: it turns `warranty_policies.name`
from text into `{fa, en}` jsonb in place, and releases older than it render the warranty pages and
the admin policy and code lists wrongly or fail against the new column. That happens while the
release that brings it builds, and after any rollback across it, so ship that release at a quiet
hour. To roll back across a contract step, restore the database as well. Take a backup right before
any release that adds a migration:

```bash
sudo /usr/local/sbin/mandegar-backup
bash deploy/release.sh
```

If that release has to go, stop the service, restore that dump as described in
[Backups](#10-backups), point `current` at the older release and start the service. Admin edits,
tickets and messages saved after the backup are lost, so when the schema is not the problem, fix
forward with a new release instead.

## 10. Backups

`deploy/backup.sh` writes `db-<stamp>.sql.gz` (a plain `pg_dump`) and `uploads-<stamp>.tar.gz` to
`/var/backups/mandegar` and deletes files older than 14 days. It reads `DATABASE_URL` and
`UPLOAD_DIR` from `/etc/mandegar/mandegar.env` and hands the password to `pg_dump` through the
environment, so it never shows in the process list.

The cron job runs as root, so it runs a root-owned copy of the script, never the one in the deploy
user's checkout. Install the copy and the cron entry, and run it once:

```bash
cd /opt/mandegar/source
sudo install -o root -g root -m 755 deploy/backup.sh /usr/local/sbin/mandegar-backup
sudo install -o root -g root -m 644 deploy/backup.cron /etc/cron.d/mandegar-backup
sudo /usr/local/sbin/mandegar-backup
```

When a `git pull` changes `deploy/backup.sh`, review the diff and run the first `install` line
again. Other settings come from the environment: `BACKUP_DIR`, `RETENTION_DAYS` and `ENV_FILE`.

Keep an encrypted off-site copy, for example in ArvanCloud Object Storage through an rclone `crypt`
remote. Create an `s3` remote for the bucket and a `crypt` remote on top of it with
`sudo rclone config` (keep the crypt passwords somewhere off the server, or the backups cannot be
decrypted), then sync as root, because the backups are readable by root only:

```bash
sudo rclone sync /var/backups/mandegar arvan-crypt: --max-age 48h
```

Restore into an empty database, with the app stopped. The restore connects as the `mandegar` role
through peer authentication, so the tables stay owned by the app and no password is typed:

```bash
sudo systemctl stop mandegar
sudo -u postgres dropdb mandegar && sudo -u postgres createdb --owner mandegar mandegar
sudo gunzip -c /var/backups/mandegar/db-20260101-031700.sql.gz \
  | sudo -u mandegar psql -v ON_ERROR_STOP=1 -d mandegar
sudo rm -rf /var/lib/mandegar/uploads
sudo tar -xzf /var/backups/mandegar/uploads-20260101-031700.tar.gz -C /var/lib/mandegar
sudo chown -R mandegar:mandegar /var/lib/mandegar/uploads
sudo chmod -R go-rwx /var/lib/mandegar/uploads/private
sudo systemctl start mandegar
```

Test a restore on a scratch server at least once before launch.

## 11. Logs and monitoring

```bash
journalctl -u mandegar -f
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

- nginx stamps every request with `X-Request-ID` (`rid=` in the access log), passes it to the app
  and returns it to the client, so a user-reported ID can be traced.
- The access log masks the private tracking token (`t=`) and the signature of customer attachment
  links (`signature=`), in the request line and in the referrer.
- `GET /api/health` returns 200 with `{ status: "ok", configuration: true, database: true }`, or an
  error when the database is down or the environment file fails validation (see the environment
  reference). The release script waits for it, so a release with an invalid setting is rolled
  back; point an uptime monitor at it as well.
- systemd restarts the app if it exits. Ubuntu rotates the nginx logs with logrotate; cap the
  journal with `SystemMaxUse=500M` in `/etc/systemd/journald.conf` if the disk is small.

## 12. Scaling notes

- Scale vertically first. The app is a single Node process; ISR keeps most page views off the
  database, and nginx serves uploads and static assets without touching Node.
- Image optimization (`/_next/image`) and Open Graph cards (`/og/`) are the main CPU costs. nginx
  caches both in `/var/cache/nginx` for 30 days, keyed by URL and, for images, by the format the
  `Accept` header negotiates (AVIF, WebP or the original), so releases and restarts do not
  re-encode them. Inspect hits with the `X-Cache-Status` response header.
- Running several app processes needs a shared ISR cache and the S3 storage driver for uploads;
  until then keep one process. The cache handler shares tag expiries through PostgreSQL but reads
  them once per process and keeps rendered pages on the local disk.
- If the catalog grows large, tune PostgreSQL with `shared_buffers` around 25% of RAM in a file
  under `/etc/postgresql/16/main/conf.d/`, then `sudo systemctl restart postgresql`.

## 13. ArvanCloud CDN notes

- Cache at the edge: `/_next/static/*` and `/uploads/*` are immutable (`max-age=31536000,
immutable`), and so are `/_next/image` results for a given URL.
- HTML pages carry `Cache-Control: s-maxage=3600, stale-while-revalidate=…` from ISR. On-demand
  revalidation after an admin edit refreshes the origin, not the CDN, so either keep HTML out of
  the edge cache (recommended: the origin already serves it from the ISR cache in milliseconds) or
  accept up to an hour of delay and purge the CDN after important edits.
- Bypass the cache for `/api/*` and `/admin/*`. Both send `no-store` or private responses.
- Enable Brotli at the edge; the origin nginx compresses with gzip.
- Restore the visitor IP at the origin, otherwise every visitor shares the CDN's rate-limit
  bucket. Add this to the `http` block of `/etc/nginx/nginx.conf`, with one `set_real_ip_from`
  line per range from ArvanCloud's published list of edge IPs:

  ```nginx
  set_real_ip_from 185.143.232.0/22;
  real_ip_header X-Forwarded-For;
  real_ip_recursive on;
  ```

- Keep the WAF and DDoS protection on; the origin's own rate limits remain as a second layer.

## Environment reference

Application settings, in `/etc/mandegar/mandegar.env`:

| Variable                             | Required | Default / example                       | Purpose                                                   |
| ------------------------------------ | -------- | --------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                       | yes      | `postgres://…@127.0.0.1:5432/mandegar`  | PostgreSQL connection                                     |
| `NEXT_PUBLIC_SITE_URL`               | yes      | `https://mandegar.ir`                   | Public origin; compiled into the build                    |
| `APP_ORIGIN`                         | yes      | `https://mandegar.ir`                   | Only origin allowed for non-GET API requests              |
| `SESSION_SECRET`                     | yes      | 64 hex characters                       | Signs form tokens, derives ALTCHA & TOTP keys, hashes IPs |
| `SESSION_SECRET_PREVIOUS`            | no       |                                         | Old `SESSION_SECRET` while rotating (docs/security.md)    |
| `UPLOAD_DIR`                         | yes      | `/var/lib/mandegar/uploads`             | Absolute media directory (`uploads` in development)       |
| `STORAGE_DRIVER`                     | no       | `local`                                 | `local` or `s3`                                           |
| `S3_ENDPOINT`                        | for s3   | `https://s3.ir-thr-at1.arvanstorage.ir` | S3-compatible endpoint                                    |
| `S3_REGION`                          | no       | `default`                               | S3 region                                                 |
| `S3_BUCKET`                          | for s3   |                                         | Bucket name                                               |
| `S3_ACCESS_KEY_ID`                   | for s3   |                                         | Access key                                                |
| `S3_SECRET_ACCESS_KEY`               | for s3   |                                         | Secret key                                                |
| `ALTCHA_COST`                        | no       | `2000`                                  | Proof-of-work cost                                        |
| `SMS_DRIVER`                         | no       | `console`                               | `console`, `kavenegar` or `none`                          |
| `KAVENEGAR_API_KEY`                  | for sms  |                                         | Kavenegar API key                                         |
| `KAVENEGAR_TEMPLATE_TICKET_RECEIVED` | no       | `mandegar-ticket-received`              | Verify-lookup template for new tickets                    |
| `KAVENEGAR_TEMPLATE_TICKET_UPDATED`  | no       | `mandegar-ticket-updated`               | Verify-lookup template for ticket updates                 |
| `SEED_OWNER_EMAIL`                   | seed     |                                         | Owner account created by the seed                         |
| `SEED_OWNER_PASSWORD`                | seed     | 12+ characters                          | Initial owner password; never overwritten by later seeds  |
| `SEED_DEMO`                          | no       | blank (`false` on a server)             | `true` seeds placeholder content (step 8)                 |
| `GOOGLE_SITE_VERIFICATION`           | no       |                                         | Search Console verification token                         |
| `BING_SITE_VERIFICATION`             | no       |                                         | Bing Webmaster verification token                         |
| `INDEXNOW_ENABLED`                   | no       | `false`                                 | Set to `true` to send IndexNow pings (see docs/seo.md)    |
| `INDEXNOW_KEY`                       | no       |                                         | IndexNow key (see docs/seo.md)                            |
| `NPM_REGISTRY`                       | no       | `https://registry.npmjs.org/`           | npm mirror for Corepack and pnpm in the release script    |
| `COREPACK_INTEGRITY_KEYS`            | no       |                                         | `0` when a mirror breaks Corepack's npm signature check   |

Both Kavenegar templates receive the tracking code as `%token`. The ticket-updated template, sent
when staff reply to the customer or change the status, also receives the current status as
`%token2`: the Persian label the tracking page shows, with spaces replaced by hyphens.

The systemd unit sets `NODE_ENV=production`, `HOSTNAME=localhost`, `PORT=3000` and `NODE_OPTIONS`
itself; do not set them in the file.

Blank optional values, like the placeholders in `.env.example`, count as unset and fall back to the
defaults above. A validated setting (`DATABASE_URL` through `KAVENEGAR_TEMPLATE_TICKET_UPDATED` in
the table) that is present but invalid, or a missing required one such as the blank `SESSION_SECRET`
in `.env.example`, makes `/api/health` fail: 503 with `configuration: false`, or 500 when the broken
setting is one of the base settings every request reads (`DATABASE_URL` through `UPLOAD_DIR`). The
journal (`journalctl -u mandegar`) shows a message naming the variable, and the release script rolls
the release back. The app also refuses the placeholder `SESSION_SECRET` that older copies of
`.env.example` shipped.

In production, `/api/health` also answers 503 with `configuration: false`, and the journal lists
each problem after `Invalid production environment`, while `NEXT_PUBLIC_SITE_URL`, `APP_ORIGIN` or
`UPLOAD_DIR` is blank or missing, either URL is not `https://` (plain `http://` is accepted only
for `localhost`, `127.0.0.1` and `[::1]`), `APP_ORIGIN` is not the origin of `NEXT_PUBLIC_SITE_URL`,
`UPLOAD_DIR` is a relative path, or `NEXT_PUBLIC_SITE_URL` differs from the value compiled into the
running release. After changing `NEXT_PUBLIC_SITE_URL`, release again.

Release and backup scripts, set in the shell that runs them:

| Variable         | Script       | Default                            | Purpose                                     |
| ---------------- | ------------ | ---------------------------------- | ------------------------------------------- |
| `ENV_FILE`       | both         | `/etc/mandegar/mandegar.env`       | Environment file to load                    |
| `APP_ROOT`       | `release.sh` | `/opt/mandegar`                    | Holds `releases/` and the `current` symlink |
| `APP_USER`       | `release.sh` | `mandegar`                         | Owner of release directories                |
| `SERVICE`        | `release.sh` | `mandegar`                         | systemd unit to restart                     |
| `KEEP_RELEASES`  | `release.sh` | `5`                                | Releases kept on disk                       |
| `HEALTH_URL`     | `release.sh` | `http://127.0.0.1:3000/api/health` | Health check after the switch               |
| `BACKUP_DIR`     | `backup.sh`  | `/var/backups/mandegar`            | Where archives are written                  |
| `RETENTION_DAYS` | `backup.sh`  | `14`                               | Age at which archives are deleted           |
