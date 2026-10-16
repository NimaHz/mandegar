# Security

This document summarizes what Mandegar protects, against whom, and how. It covers the public site,
the `/api` backend, the admin panel and the production host.

## Threat model

| Asset                                 | Main threats                                                       |
| ------------------------------------- | ------------------------------------------------------------------ |
| Admin accounts and sessions           | Credential stuffing, phishing, session theft, privilege escalation |
| Customer data in tickets and messages | Enumeration of tracking codes, scraping, leakage through logs      |
| Catalog and content integrity         | Defacement through a compromised account, stored XSS via markdown  |
| Warranty codes                        | Enumeration to harvest valid codes, fake lookups at scale          |
| Availability                          | Form spam, scripted lookups, upload abuse, layer-7 floods          |
| Host and database                     | Leaked secrets, exposed ports, missing or untested backups         |

Out of scope: payments (the site has none), customer accounts (customers never sign in; tickets are
reached with a tracking code plus phone number, or a private token link).

## Controls

### Authentication

- Passwords are hashed with argon2id (`@node-rs/argon2`). Failed logins for unknown emails still
  run a verification against a decoy hash, so response time does not reveal which emails exist, and
  every failure returns the same `INVALID_CREDENTIALS` response.
- Login lockouts are stored in PostgreSQL and counted atomically: 5 failures per email and client per
  15 minutes, 20 per email and client per day, and 30 per client per 15 minutes. Failures for one
  email from every client never lock the account; past 5 per 15 minutes or 20 per day each further
  attempt waits up to 5 seconds and the owner sees a `login.throttled` audit entry. nginx adds a
  per-IP request limit on `/api/auth`.
- Optional TOTP two-factor authentication (otplib). Owners should enable it.
- Users created by an owner get a temporary password and `mustChangePassword`; the API refuses
  other actions with `PASSWORD_CHANGE_REQUIRED` until it is changed.

### Sessions

- A session is a random 32-byte token in the `__Host-mandegar_sid` cookie: `HttpOnly`, `Secure`,
  `SameSite=Lax`, `Path=/`, no `Domain`. Only the token's SHA-256 is stored, so a database leak
  does not yield usable sessions.
- Sliding expiry of 7 days with a 30-day absolute cap. Sessions record IP and user agent, can be
  listed and revoked from the account page, are rotated on login and revoked on password change or
  deactivation.

### Authorization (RBAC)

Three roles map to explicit permissions (`src/server/auth/permissions.ts`), checked by the `can`
macro on every admin route and by `requireAdmin` on every admin page:

- `owner`: everything, including users, settings and the audit log;
- `editor`: catalog, content, media and warranty codes;
- `support`: tickets and contact messages, read-only catalog.

### CSRF and origin checks

Every non-GET request to `/api` must carry an `Origin` equal to `APP_ORIGIN`, or
`Sec-Fetch-Site: same-origin` when no `Origin` is sent; anything else is rejected with
`ORIGIN_REJECTED`. Combined with `SameSite=Lax` cookies and JSON or multipart bodies, this blocks
cross-site request forgery without tokens. Admin pages also send `form-action 'self'` in the CSP.

### Rate limits

Two layers:

- **Application** (PostgreSQL `rate_limits` table, keyed by an HMAC of the client IP so raw IPs are
  never stored): search and challenge endpoints 60 per minute; tickets 5 per hour; contact 5 per
  hour; ticket replies 20 per hour; ticket tracking 20 misses per 10 minutes; warranty lookups 10
  failures per minute and 50 per day. Responses are `429` with `Retry-After`.
- **nginx** (`limit_req`): `/api/auth`, `/api/tickets`, `/api/contact` and `/api/warranty` per IP.
  Its rejections use the app's JSON error shape: `429` `RATE_LIMITED`, and `413`
  `PAYLOAD_TOO_LARGE` for a body over `client_max_body_size`, so the forms show the right message.
  `/og/` allows 10 requests per second per IP with a burst of 300. A card is rendered at most once
  per item, language and content version (any other URL gets a `308` to the canonical one) and
  nginx serves repeats from its cache, so the limit only stops floods and never throttles search
  engines or link-preview services such as Telegram's, which fetch many cards from a few addresses.

The client IP comes from `X-Real-IP`, which nginx sets from the connection. Behind a CDN, configure
`set_real_ip_from` (see docs/deploy.md), otherwise all visitors share one bucket.

### Spam protection on public forms

- ALTCHA proof-of-work, self-hosted (`altcha-lib` on both sides, no third-party script). Challenges
  expire after 10 minutes, keys are derived from `SESSION_SECRET`, and each solved challenge is
  recorded so a replay fails.
- A hidden honeypot field.
- An HMAC-signed timestamp: submissions faster than 3 seconds or older than 2 hours are rejected.
- At most 3 open tickets per phone number.

### Enumeration resistance

- Warranty lookups return one identical `not-found` object for every miss, and the check symbol
  rejects mistyped codes before they reach the database.
- Ticket tracking needs the tracking code and the matching phone number, or the 32-byte access token
  (stored only as SHA-256). The public view masks the phone and never includes the address or
  internal notes.

### Uploads

- Types are detected from magic bytes (`file-type`), never from the file name or the client's MIME
  type. Only JPEG, PNG, WebP, AVIF, MP4, WebM and PDF are accepted, with per-kind size limits; the
  request body is capped before parsing (1 MB by default, 30 MB for tickets, 210 MB for admin media).
  Admin requests are authenticated before the body is read, and nginx only accepts a large
  `/api/admin/media` body when a session cookie is present.
- Images are decoded and re-encoded with sharp, which strips EXIF and other metadata (including GPS)
  and neutralizes polyglot files. SVG is not accepted.
- Files get random keys (`YYYY/MM/<ulid>.<ext>`), deduplicated by SHA-256. The `/uploads` handler
  only serves keys that match a strict pattern, with a fixed `Content-Type` per extension and
  `X-Content-Type-Options: nosniff`; nginx serves the same files with the same restrictions.
- Customer and staff ticket attachments are kept out of the media library. They are stored under
  `private/`, which neither `/uploads` nor nginx serves, and are streamed only to `tickets:read`
  staff or through signed, expiring customer links.

### Content Security Policy and headers

Set in `next.config.ts` for every route except `/uploads`:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self';
frame-src https://www.aparat.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

- The policy is static on purpose. Nonce-based CSP forces every page to render dynamically, which
  would disable ISR for the catalog. `script-src 'unsafe-inline'` is required for the theme boot
  script (it sets the theme before first paint to avoid a flash) and for the inline scripts Next.js
  emits to bootstrap hydration and stream React Server Component payloads.
- The remaining restrictions still apply: scripts load only from our origin, nothing can be framed
  except Aparat videos, the site cannot be framed, plugins are disabled and `<base>` cannot be
  hijacked. ALTCHA uses Web Crypto and needs no `wasm-unsafe-eval`.
- There is no `'unsafe-eval'` in production. Zod 4 probes `new Function` to enable its JIT parser,
  which a strict CSP reports as a violation even though the probe is caught, so
  `src/instrumentation-client.ts` switches Zod to `jitless` mode before any application code runs.
- Development adds `'unsafe-eval'` (React Refresh) and `ws:` (hot reload). `upgrade-insecure-requests`
  is sent only in production builds whose `NEXT_PUBLIC_SITE_URL` is HTTPS.
- Other headers: `Strict-Transport-Security` (2 years, subdomains), `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, `X-Robots-Tag: noindex` on
  `/admin`, and `Cache-Control: no-store` on every API response.
- Markdown (products, category descriptions, FAQ answers, guides, posts) is rendered on the server
  by a sanitizing renderer; raw HTML in markdown is not passed through.
- The service worker never caches `/api`, `/admin` or non-GET requests.

### Audit log

Every admin mutation writes an `audit_logs` row with the actor, action, entity, a diff, IP and user
agent. Owners can browse it at `/admin/audit`. Sign-ins, password changes, TOTP changes and session
revocations are logged too.

### Secrets

- All secrets live in environment variables (`/etc/mandegar/mandegar.env` on the server, owned by
  root with mode 600, never committed; `.gitignore` excludes every `.env*` file except
  `.env.example`).
- `SESSION_SECRET` (32+ random bytes) keys form tokens, ALTCHA, IP hashing and customer attachment
  links, and encrypts the stored TOTP secrets. Rotating it signs out nobody but invalidates in-flight
  forms, challenges and attachment links, and resets IP-keyed rate-limit buckets.
- To rotate it, move the old value to `SESSION_SECRET_PREVIOUS` and set a fresh `SESSION_SECRET`,
  then restart. TOTP secrets sealed with the previous key still open, and each one is re-sealed with
  the new key at that user's next successful two-factor sign-in. Rotating without
  `SESSION_SECRET_PREVIOUS` locks every two-factor user out. Remove the previous value once every
  two-factor user has signed in; an owner's password reset turns two-factor off for anyone left.
- If the only owner cannot pass two-factor, turn it off on the server and sign in with the
  password:
  `sudo -u mandegar psql -d mandegar -c "update users set totp_enabled = false, totp_secret = null where email = '<owner email>'"`.
- The app runs as the unprivileged `mandegar` system user under a hardened systemd unit: read-only
  system, private `/tmp`, no new privileges or capabilities, no namespaces, and a system-call filter
  limited to `@system-service`. It can write only to the uploads directory and its release's
  `.next` cache. Customer ticket attachments under `uploads/private` are written mode 600, readable
  by the app only; nginx refuses that path.
- Releases are built by the deploy user, never by root. `deploy/release.sh` installs dependencies
  without the production secrets in their environment and drops cached sudo credentials before
  any package script runs. Corepack verifies pnpm against the SHA-512 pinned in `package.json`.
- The root cron job runs a root-owned copy of the backup script (`/usr/local/sbin/mandegar-backup`),
  not the deploy user's checkout, and passes the database password to `pg_dump` through the
  environment instead of the command line.
- PostgreSQL and the app listen on loopback only; nginx is the only public listener.
- Dependencies are pinned to exact versions in `package.json` and the lockfile, and pnpm enforces
  a minimum release age for new versions, with explicit exceptions in `pnpm-workspace.yaml`.

### Backups

Nightly `pg_dump` and uploads archive with 14-day rotation (`deploy/backup.sh`). Backups contain
customer data: keep them on the server with mode 600, encrypt off-site copies, and test restores.

### Privacy by design

- No third-party scripts, analytics, fonts or embeds other than the Aparat video frame on guide and product pages that have an Aparat video.
- Visitor IPs are stored only as keyed hashes (rate limits, contact messages). Raw IPs are kept only
  for staff: on admin sessions and in the audit log.
- Cookies are used only for admin sessions; theme and compare preferences stay in local storage.

## Go-live checklist

- [ ] `SESSION_SECRET` is a fresh 32-byte random value (`openssl rand -hex 32`) and differs from
      every other environment.
- [ ] The database password is random and only in `/etc/mandegar/mandegar.env` (mode 600).
- [ ] `NEXT_PUBLIC_SITE_URL` and `APP_ORIGIN` are the final `https://` origin; `/api/health`
      reports `configuration: false` until they are.
- [ ] The seeded owner has signed in, changed the password and enabled TOTP; remove or rotate
      `SEED_OWNER_PASSWORD` in the environment file afterwards.
- [ ] No placeholder users remain; each staff member has their own account with the least role.
- [ ] If the seed ran with `SEED_DEMO=true`, every placeholder product, page and setting has been
      replaced or deleted.
- [ ] HTTPS works on the apex and `www`, HTTP redirects to HTTPS, and certificate renewal passes
      `certbot renew --dry-run`.
- [ ] Session cookies are `__Host-` prefixed and `Secure` (production mode); check in the browser.
- [ ] Response headers include the CSP and HSTS (`curl -sI https://<domain>/`).
- [ ] After a few weeks without HTTPS issues, add `; preload` to HSTS and submit the domain at
      hstspreload.org.
- [ ] Rate limits see real client IPs (check `X-Real-IP` behind the CDN).
- [ ] Only ports 22, 80 and 443 are open (`ufw status`); SSH uses keys only.
- [ ] Backups run nightly, an off-site copy exists, and a restore has been tested.
- [ ] Placeholder content, contact details, company identifiers and legal pages are replaced and
      reviewed.
- [ ] `SMS_DRIVER` is `none` or a configured `kavenegar`, not `console`.
- [ ] Enamad (eNamad) and Samandehi registrations are complete, and their trust seals are added
      as required. The site shows no seals until then; adding one means placing its official
      embed code in the footer and adding its host to `img-src` in `next.config.ts`.
- [ ] `/api/health` is monitored externally.
