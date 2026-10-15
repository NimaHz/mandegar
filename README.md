# Mandegar · ماندگار

The bilingual website of Mandegar, an Iranian home-appliance brand that makes evaporative coolers,
gas and electric heaters, water heaters, fans and kitchen appliances, and distributes partner brands.

The site is a product catalog (no prices, cart or checkout) with warranty lookup, after-sales service
requests with ticket tracking, installation guides, service centres, a magazine and a Persian-only
admin panel. Persian (RTL) is served at `/` and English (LTR) at `/en`.

It is built to run on a single Iranian VPS with no runtime dependency on foreign services: fonts,
scripts, images and the proof-of-work spam challenge are all self-hosted.

## Stack

| Concern    | Choice                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack, React Compiler, typed routes, ISR)         |
| UI runtime | React 19.3                                                                    |
| API        | Elysia 1.4 mounted inside Next at `/api`, typed client through Eden           |
| Database   | PostgreSQL 16 with Drizzle ORM and drizzle-kit migrations                     |
| Validation | Zod 4, shared between API schemas and React Hook Form                         |
| Styling    | Tailwind CSS 4 (CSS-first `@theme` tokens), light and dark themes             |
| Motion     | Motion 14 (`LazyMotion` with `m` components) and Lenis                        |
| State      | Zustand 5 (persisted, hydration-safe) and nuqs 2 for URL state                |
| Auth       | argon2id (`@node-rs/argon2`), database sessions, optional TOTP (otplib)       |
| Media      | sharp (WebP and AVIF), local disk or S3-compatible storage (ArvanCloud)       |
| Anti-spam  | ALTCHA proof-of-work (self-hosted), honeypot, signed form tokens, rate limits |
| Fonts      | Vazirmatn, Estedad and JetBrains Mono, self-hosted with `next/font/local`     |
| Tooling    | pnpm 11, TypeScript 6, ESLint 9, Prettier 3, `node:test` through tsx          |

## Architecture

```
src/
├── app/                     Routes only: composition, metadata and data loading
│   ├── [locale]/(site)/     Public site for fa (/) and en (/en), with header and footer
│   ├── admin/               Admin panel (dynamic, noindex)
│   ├── api/[[...slugs]]/    Mounts the Elysia app
│   ├── uploads/[...path]/   Streams stored media with range support
│   ├── w/[code]/            Short warranty links from printed labels
│   ├── manifest.ts          Web app manifest
│   └── sitemap, robots, llms.txt and OG image routes
├── features/<feature>/      UI owned by one product area: components, content.ts, search-params.ts
├── components/              ui (primitives), shared, layout, motion, brand, icons, seo, pwa, providers
├── services/                Server-only data access used by pages (`api`), plus admin services
├── server/                  Backend: Elysia app, modules, plugins, auth, db schema, seed, storage
├── i18n/                    Locale config, dictionaries, path helpers and providers
├── lib/                     Pure helpers: routes, formatting, Jalali dates, Persian text, codes, SEO
├── stores/                  Zustand stores (compare, recently viewed, UI)
├── config/                  Site, navigation, env and viewport configuration
├── types/                   Domain types shared by client and server
├── styles/                  Global CSS, design tokens and fonts
└── proxy.ts                 Locale rewrite, canonical redirects
```

Data flows in two directions:

- **Reads.** Pages are async Server Components. They call `api` from `src/services`, which
  implements the contracts in `src/services/contracts.ts` with Drizzle queries and resolves
  bilingual fields to the requested locale. Public pages use ISR (`revalidate = 3600`) and are
  revalidated on demand after every admin mutation.
- **Writes and interactive reads.** Client components call `/api` through the typed Eden client
  (`src/lib/api-client.ts`). Elysia modules in `src/server/modules/<name>` validate input with Zod,
  enforce origin checks, body limits and Postgres-backed rate limits, and write an audit log entry for
  every admin mutation.

The full API reference is in [docs/backend.md](docs/backend.md).

## Local setup

Requirements: Node.js 22, pnpm 11 (through Corepack) and PostgreSQL 16.

```bash
corepack enable
pnpm install

createuser -P mandegar
createdb -O mandegar mandegar

cp .env.example .env.local
```

Edit `.env.local`: set `DATABASE_URL`, a random `SESSION_SECRET` (`openssl rand -hex 32`) and the
seed owner credentials. Then:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The site runs at http://localhost:3000 and the admin at http://localhost:3000/admin.

The seed is idempotent. It creates the owner account, placeholder catalog and content in both
languages, warranty policies and codes, service centres and sample tickets. Product photos are
downloaded once into `UPLOAD_DIR` (and cached in `UPLOAD_DIR/.seed-cache`); when the download
hosts are unreachable, the seed generates neutral placeholder images instead, so it also works
offline and in CI.

## Scripts

| Script                     | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                 | Development server                                             |
| `pnpm build`               | Production build (`output: "standalone"`; needs the database)  |
| `pnpm standalone:assemble` | Copy `public` and `.next/static` into `.next/standalone`       |
| `pnpm start:standalone`    | Run the standalone server                                      |
| `pnpm lint`                | ESLint (Next core-web-vitals, TypeScript, import sorting)      |
| `pnpm typecheck`           | Generate route types and run `tsc`                             |
| `pnpm test`                | Unit and API integration tests (`node:test`, needs a database) |
| `pnpm format`              | Prettier with Tailwind class sorting                           |
| `pnpm check`               | Format check, lint, typecheck and build                        |
| `pnpm db:generate`         | Generate a migration from schema changes                       |
| `pnpm db:migrate`          | Apply migrations                                               |
| `pnpm db:seed`             | Seed the owner and placeholder content                         |
| `pnpm db:studio`           | Drizzle Studio                                                 |
| `pnpm deploy:release`      | Build and roll out the Docker stack (see deployment)           |
| `pnpm deploy:backup`       | Database dump and uploads archive with rotation                |

## Testing

`pnpm test` runs every `src/**/*.test.ts` file with `node:test`:

- pure libraries such as warranty and tracking codes and Persian normalization;
- API integration tests that call the Elysia app in-process against the database configured in
  `.env.local`, covering warranty lookup, tickets with ALTCHA, contact, rate limits and origin checks.

The integration tests refuse to start unless `APP_ORIGIN` is `http://localhost:3000` and `NODE_ENV`
is not `production`, so they never write to a production database. The accounts they create get
random passwords, and any `@test.local` account an interrupted run leaves behind is removed by the
next run.

CI (`.github/workflows/ci.yml`) runs format check, lint and typecheck, then migrates and seeds a
PostgreSQL 16 service, runs the tests, builds, and smoke-tests the standalone server.

## Conventions

- No comments in source files. Names and small functions carry the intent.
- Server Components by default; `"use client"` only where interaction or motion needs it.
- Every link goes through `localizePath(locale, routes.x)`; routes live in `src/lib/routes.ts`.
- Feature copy lives in `src/features/<feature>/content.ts` as `Record<Locale, …>`; shared chrome
  copy lives in `src/i18n/dictionaries`.
- Logical CSS properties only (`ms`, `pe`, `start`, `end`), so RTL and LTR share one layout.
- Design values come from the tokens in `src/styles/globals.css`; no raw colours in components.
- Numbers and dates go through `formatNumber` and `formatDate` (Jalali for fa, Gregorian for en,
  Asia/Tehran time zone).
- Model codes, phone numbers and warranty codes are isolated with `<bdi dir="ltr">`.

## Deployment

Production runs as a Docker Compose stack (PostgreSQL, a one-shot migrator, the standalone Next
server and nginx) on an Ubuntu VPS, with Iranian mirrors for Docker images and npm packages. A
systemd unit is provided for hosts without Docker. See [docs/deploy.md](docs/deploy.md) for the full
procedure and [docs/security.md](docs/security.md) for the security model and the go-live checklist.

## Admin first login

The seed creates the owner account from `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD`. Sign in at
`/admin/login` with those credentials, then:

1. change the password from the account page and enable two-factor authentication;
2. replace the placeholder contact details, company information and statistics in settings;
3. invite editors and support staff with the least privileged role that fits (`editor` or `support`).

Re-running the seed never overwrites an existing owner password.
