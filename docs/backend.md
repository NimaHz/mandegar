# Backend reference

Elysia runs inside Next at `src/app/api/[[...slugs]]/route.ts` with the prefix `/api`. Server components read data through `api` (`src/services/index.ts`, server-only). Client components call `/api` through the Eden client `apiClient` (`src/lib/api-client.ts`).

Every error response has this shape:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Invalid request",
    "fields": { "phone": "Invalid mobile number" }
  }
}
```

`fields` is present only for `VALIDATION` (422). The codes are:

| Code                       | Status | Meaning                                                                                         |
| -------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `BAD_REQUEST`              | 400    | Malformed body or parameters                                                                    |
| `VALIDATION`               | 422    | Invalid input; `fields` maps each field path to its message                                     |
| `SPAM_REJECTED`            | 400    | Honeypot filled, or the form token is too fresh, expired or invalid                             |
| `CHALLENGE_FAILED`         | 403    | ALTCHA payload missing, invalid, expired or already used                                        |
| `ORIGIN_REJECTED`          | 403    | A non-GET request came from a foreign `Origin`                                                  |
| `UNAUTHORIZED`             | 401    | No valid session                                                                                |
| `INVALID_CREDENTIALS`      | 401    | Login failed; the same response whatever the reason                                             |
| `PASSWORD_CHANGE_REQUIRED` | 403    | The user must change a temporary password first                                                 |
| `FORBIDDEN`                | 403    | The role lacks the permission                                                                   |
| `NOT_FOUND`                | 404    | Missing resource, or a ticket that cannot be matched                                            |
| `CONFLICT`                 | 409    | Unique clash or invalid state                                                                   |
| `STALE`                    | 409    | `expectedUpdatedAt` no longer matches; someone else saved the item after it was loaded          |
| `IN_USE`                   | 409    | The item is still referenced, for example media or a category                                   |
| `HAS_WARRANTY_CODES`       | 409    | The product has issued warranty codes; archive it instead of deleting it                        |
| `LIMIT_REACHED`            | 409    | Business limit reached, for example 3 open tickets per phone                                    |
| `LENGTH_REQUIRED`          | 411    | Chunked body sent without `Content-Length`                                                      |
| `PAYLOAD_TOO_LARGE`        | 413    | The body or a file is too big                                                                   |
| `UNSUPPORTED_MEDIA`        | 415    | The file type is not allowed (checked by magic bytes), or the body has the wrong `Content-Type` |
| `RATE_LIMITED`             | 429    | Too many requests; the `Retry-After` header is set                                              |
| `INTERNAL`                 | 500    | Unexpected error; no stack in production                                                        |

Security rules for every request:

- Non-GET requests must send `Origin` equal to `APP_ORIGIN`, or `Sec-Fetch-Site: same-origin` when there is no `Origin`.
- Bodies are capped at 1 MB. The caps are 30 MB for `POST /api/tickets`, customer and staff ticket replies, and 210 MB for `POST /api/admin/media`.
- The client IP is read from `X-Real-IP`, then the first `X-Forwarded-For` entry. It is hashed with HMAC(`SESSION_SECRET`) into a `clientKey` used for rate limits. The reverse proxy must set these headers.
- API responses send `Cache-Control: no-store`.

## Public endpoints

`locale` is `"fa" | "en"` and defaults to `"fa"` when it is missing or invalid.

### GET /api/health

Returns `{ status: "ok" | "degraded", configuration: boolean, database: boolean, time: string }`. The status code is 503 when the database is down or the server environment fails validation (`getServerEnv()`); the validation error, naming the variable, is logged to the server log. When a base setting from `src/config/env.ts` (`DATABASE_URL`, `SESSION_SECRET` and the rest of `getEnv()`) is invalid, every API request, this one included, fails with 500 `INTERNAL`, because the client key is derived from `SESSION_SECRET` through `getEnv()`.

### GET /api/search?q=&locale=

Rate limit: 60 per minute per IP. Returns `{ hits: SearchHit[] }` (`src/types/catalog.ts`), at most 8 hits.

- `href` is already localized: `/products/x` for fa, `/en/products/x` for en.
- An empty `q`, or one shorter than 2 characters after normalization, returns `{ hits: [] }`.
- Matching ignores Arabic/Persian letter variants, ZWNJ, spaces, hyphens and Persian digits, so `mc45`, `MC 4500` and `MC-4500` all find the MC-4500, and `فن هیتر` finds `فن‌هیتر`. A trigram fallback catches small typos in longer queries.
- Hit order is products (up to 5), categories (2), guides (2) and posts (2), then any remaining hits.

### GET /api/products?slugs=&locale=

Rate limit: 60 per minute per IP. `slugs` is a comma-separated list; the first 12 are used. Returns `{ items: ProductListItem[] }` (`src/types/catalog.ts`) for the slugs that match visible products, in no particular order. The recently viewed strip on product pages calls it only when the browser has stored other slugs.

### POST /api/warranty/lookup

Body: `{ code: string, locale?: Locale }`. Returns `WarrantyLookup` (`src/types/warranty.ts`) with status 200 in every case:

- `{ status: "found", match }`. `match.code` is formatted, for example `W5K-3M9-XT0`, and `match.status` can be `active`, `revoked` or `recalled`.
- `{ status: "not-found" }`. Every miss gets this identical object.
- `{ status: "invalid", reason: "empty" | "length" | "prefix" | "check" }`.
- `{ status: "rate-limited" }`, after 10 failed lookups per minute or 50 per day per IP.

Input is normalized server-side: Persian digits, Persian keyboard letters, lowercase, dashes and O/I/L are all accepted. Validate client-side first with `parseWarrantyCode` from `src/lib/warranty-code.ts`. Lookups for archived (discontinued) products, or products whose brand or category is hidden, still resolve with `product.listed: false` (and `category.listed`), so the result page shows them without links; drafts never resolve.

### GET /api/tickets/form-token

Rate limit: 60 per minute. Returns `{ token: string }`, an HMAC-signed timestamp. Fetch it when the form mounts. A submission is rejected (`SPAM_REJECTED`) if it arrives less than 3 seconds or more than 2 hours after the token was issued. The contact form uses this endpoint too.

### GET /api/altcha/challenge

Rate limit: 60 per minute. Returns the altcha-lib v2 `Challenge` JSON exactly as `createChallenge` produces it:

```ts
{ parameters: { algorithm: "PBKDF2/SHA-256", nonce, salt, cost: 2000, keyLength: 32, keyPrefix, keySignature, expiresAt, ... }, signature: string }
```

The challenge expires after 10 minutes. The counter is a random value between 300 and 1500, and `ALTCHA_COST` defaults to 2000, so a solve takes well under a second. The HMAC keys are derived from `SESSION_SECRET`.

Client forms use `useAltcha(enabled)` from `src/components/shared/use-altcha.ts`. It fetches a challenge, solves it in Web Workers (`altcha-worker.ts`, falling back to the main thread), refreshes it every 9 minutes and returns `{ status, payload, renew }`. `<AltchaWidget state={altcha} />` renders the status. Start solving early (the request flow solves on mount, the contact form on first focus) and call `renew()` after every submission.

Send `altcha` as a multipart field named `altcha` (tickets) or as the string property `altcha` in a JSON body (contact). The server decodes the base64 JSON, runs `verifySolution`, and records the challenge signature for one hour. A replayed payload therefore fails with `CHALLENGE_FAILED`, so fetch a new challenge for every submission, including after an error.

### POST /api/tickets (multipart/form-data)

| Field          | Rule                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`         | `TicketType`                                                                                                      |
| `name`         | 2–80 characters                                                                                                   |
| `phone`        | Iranian mobile in any format (normalized to `09XXXXXXXXX`)                                                        |
| `email`        | optional email                                                                                                    |
| `province`     | province code from `src/lib/provinces.ts`, for example `"23"`                                                     |
| `city`         | 2–60 characters                                                                                                   |
| `address`      | 5–300 characters                                                                                                  |
| `warrantyCode` | optional; must pass the check symbol if present; links the ticket to the code and its product                     |
| `productSlug`  | optional; used when there is no warranty code                                                                     |
| `purchaseDate` | optional `YYYY-MM-DD` (Gregorian), not after today in Asia/Tehran                                                 |
| `subject`      | 3–120 characters                                                                                                  |
| `description`  | 10–3000 characters                                                                                                |
| `website`      | honeypot; keep it hidden and empty                                                                                |
| `formToken`    | from `GET /api/tickets/form-token`                                                                                |
| `altcha`       | the base64 payload described above                                                                                |
| `locale`       | optional                                                                                                          |
| `attachments`  | 0–5 files (repeat the field), jpg/png/webp/pdf, 5 MB each; images are re-encoded to webp and metadata is stripped |

The same field rules are exported as `ticketFieldsSchema` from `src/server/modules/tickets/schema.ts` for react-hook-form, along with `TICKET_ATTACHMENT_LIMIT`, `TICKET_ATTACHMENT_MAX_BYTES`, `ticketAttachmentTypes` and `mentionsGasSmell(text)`.

Returns `TicketReceipt`: `{ trackingCode: "T5K3M9XT0", accessToken: string, urgent: boolean }`.

- `trackingCode` is raw. Display it with `formatTrackingCode`.
- Build the private tracking link as `/support/track?t=<accessToken>`. The token is shown only once.
- `urgent` is true when the subject or description mentions «بوی گاز» or "gas smell". Show the safety notice (close the valve, call 194).

Other limits:

- More than 5 attachments, or one over 5 MB, returns `PAYLOAD_TOO_LARGE` (413) before the form token and ALTCHA are checked. A file type that is not allowed returns `UNSUPPORTED_MEDIA` (415).
- 5 tickets per hour per IP (`RATE_LIMITED`).
- At most 3 open tickets per phone (`LIMIT_REACHED`).

### POST /api/tickets/track

Body: `{ trackingCode, phone, locale? }` or `{ token, locale? }`. Returns `PublicTicket` (`src/types/support.ts`):

- The phone is masked as `0912***4567`.
- The address is never included, and internal notes are excluded.
- `canReply` is true only when the ticket was opened with the token and is not closed or rejected.
- `messages` holds `PublicTicketPost` entries (`author: "customer" | "staff"`, `body`, `attachments`) and `PublicTicketStatusChange` entries (`author: "system"`, `status`) for status changes made by staff.

A ticket that cannot be matched returns 404 `NOT_FOUND`. After 20 misses in 10 minutes per IP the response is `RATE_LIMITED`.

### POST /api/tickets/:trackingCode/messages (multipart/form-data)

Fields:

- `token` (required): the access token;
- `body`: 1–3000 characters;
- `locale`: optional;
- `attachments`: same rules as for creation.

Returns the updated `PublicTicket`. A wrong token or tracking code returns 404. A closed ticket returns 409. The rate limit is 20 per hour per IP. A reply moves `awaiting-customer` tickets back to `in-review`, and reopens a `resolved` ticket as `in-review` with a status event. A ticket closed while the upload ran returns 409 and keeps none of the files.

### POST /api/contact (JSON)

Body: `{ department, name, phone, email?, subject, body, website?, formToken, altcha }`.

- `department` is a `ContactDepartment`.
- `subject` is 3–120 characters and `body` is 10–3000.

The rate limit is 5 per hour per IP. Returns `{ received: true }`. The form field rules are exported as `contactSchema` (with input type `ContactInput`) from `src/server/modules/contact/schema.ts`. `contactRequestSchema` adds the three anti-spam fields.

## Calling the API from client components (Eden)

`src/lib/api-client.ts` exports `apiClient = treaty<App>(origin, { fetch: { credentials: "include" }, parseDate: false })`. Paths mirror the URL, starting with `.api`. ISO strings stay strings, as the shared types declare them:

```tsx
"use client";

import { apiClient, apiResult } from "@/lib/api-client";

const { data, error } = await apiClient.api.warranty.lookup.post({ code, locale });
if (error) {
  const code = (error.value as { error?: { code?: string } }).error?.code;
}

const search = await apiClient.api.search.get({ query: { q, locale } });

const ticket = await apiResult(apiClient.api.tickets.track.post({ token, locale }));
if (!ticket.ok) showError(ticket.code, ticket.fields);
```

- `data` is fully typed from the Elysia route.
- `error.status` holds the HTTP status, and `error.value` holds the `{ error: { code, message, fields? } }` body.
- `apiResult(request)` turns an Eden call into `{ ok: true, data } | { ok: false, status, code, fields }`, with `code: "NETWORK"` when the request never reached the server.
- `fetchFormToken()` returns `{ token, issuedAt } | null` from `GET /api/tickets/form-token`.
- `POST /api/tickets` and `POST /api/tickets/:trackingCode/messages` accept only multipart. Eden sends JSON when a body has no file, so these two calls use `postMultipart<TData>(path, formData)`, which returns the same `ApiResult`.
- The client is same-origin and always sends cookies.

## Server data access

### Public pages: `api`

`import { api } from "@/services"` is server-only and implements `src/services/contracts.ts` with Drizzle.

- Text is resolved to the requested locale. Missing text in one language falls back to the other.
- Only published content is returned. A product must be published, and its category and brand must also be published.
- Media URLs come from `routes.upload(storageKey)`.
- The guide for a product resolves as `product.guideId`, then the category's `defaultGuideId`, then the parent category's. Only published guides count.
- Page sizes: products 12, posts 9.
- `settings()` and `categories()` never throw on empty tables; settings fall back to safe defaults.
- `HeroSlide.ctaHref` is an unlocalized path; wrap it with `localizePath`.
- Each method is deduplicated per render with React `cache`, so the header, footer, metadata and page share one call.
- Results are kept in the Next data cache (`unstable_cache`) for an hour under the tags in `src/server/lib/cache-tags.ts`: `catalog`, `guides`, `posts`, `faqs`, `slides`, `service-centers`, `settings` and `warranty`. A slug lookup first checks the cached slug list, so unknown slugs return `null` or `[]` without touching the database or the cache. Listings with free text, unknown filters or pages past the first few skip the cache, which keeps its keys bounded. Loaders that depend on the clock (hero slides, and every post, author and blog listing) are wrapped by `scheduled()`: the cache key includes the last publish, start or end time that has passed, and the revalidate time drops to the seconds left until the next one, so scheduled posts and slides appear and expire on time on both the data cache and the ISR pages.
- `warranty.lookup`, `support.track`, `catalog.search` and `catalog.bySlugs` are never cached.
- `catalog.categoryInsights(locale, slug)` returns the model code, warranty, key facts and FAQs of a category's models in one query, and `catalog.models(locale)` returns every visible model for the service request picker.
- Pages that use a query parameter only to prefill a form (`/contact?department=`, `/support/request?code=&product=`, `/support/track?t=`, `/warranty?code=`) read it on the client with nuqs inside `Suspense`, so they stay static. The warranty result and the token ticket view load from the API in the browser. Filtered listings (`/products`, `/categories/[slug]`, `/blog`, `/guides`, `/service-centers`, `/compare`) render per request from cached data.

### Admin pages: `requireAdmin` and `adminApi`

```tsx
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { user, permissions } = await requireAdmin("catalog:read");
  const page = await adminApi.products.list({ q: "", page: 1, status: "draft" });
}
```

`requireAdmin(permission?)` (server-only, `src/server/auth/session.ts`) reads the session cookie through `next/headers`, validates the DB session and returns `{ user: AdminIdentity, permissions: Permission[] }`. It behaves as follows:

- With no valid session, it calls `redirect(adminRoutes.loginFrom(path))`, so the login page returns to the requested path through `?next=`. The path comes from the `x-admin-path` header that `src/proxy.ts` sets; without it, the redirect goes to `/admin/login`.
- When a permission is passed and the user still has a temporary password, it calls `redirect("/admin/account")`. The account page must call `requireAdmin()` without a permission.
- When the user lacks the permission, it calls `notFound()`. `forbidden()` would need `experimental.authInterrupts` in next.config.

`getAdmin()` returns `AdminIdentity | null` without redirecting, which the login page can use to bounce signed-in users. `getAdmin()` is wrapped in React `cache` (and so is the session lookup behind it), so `requireAdmin()` and `getAdmin()` validate the session once per render.

`generateMetadata` runs even when the page redirects, and its title is written into the HTML of the redirect. A detail page that puts record data in its title must check `hasAdminPermission(permission)` first and fall back to the section title.

`adminApi` (`src/services/admin/index.ts`, server-only) returns raw `LocalizedText` DTOs from `src/types/admin.ts`. Every `list` accepts a `Partial<…Query>` with defaults and returns `Paginated<T>` of 20 items. Every `get` returns `T | null`.

Products, categories, guides, posts, tickets, service centres, media, contact messages and warranty codes accept a `sort` query (`?sort=` on the endpoint, `sort` in the `adminApi` query). The allowed values per entity are in `adminSorts` (`src/types/admin.ts`); the first one is the default, and a missing or unknown value falls back to it. Persian names sort with the `fa-x-icu` collation.

| Entity           | Values (default first)                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `products`       | `updated-desc`, `created-desc`, `name-asc`, `model-asc`                |
| `categories`     | `order-asc`, `updated-desc`, `created-desc`, `name-asc`                |
| `guides`         | `updated-desc`, `created-desc`, `name-asc`                             |
| `posts`          | `updated-desc`, `created-desc`, `name-asc`                             |
| `tickets`        | `priority-desc`, `due-asc`, `updated-desc`, `created-desc`, `name-asc` |
| `serviceCenters` | `province-asc`, `updated-desc`, `created-desc`, `name-asc`             |
| `media`          | `created-desc`, `updated-desc`, `name-asc`                             |
| `messages`       | `created-desc`, `updated-desc`, `name-asc`                             |
| `warrantyCodes`  | `year-desc`, `updated-desc`, `created-desc`, `model-asc`               |

`due-asc` orders open tickets by their next SLA deadline (first response until answered, then resolution) and puts finished tickets last. `name-asc` sorts tickets and messages by the sender's name, and media by file name.

| Member             | Functions                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stats`            | `get(permissions): DashboardStats` (`recentTickets` only with tickets:read), `counts(): AdminCounts` (`{ openTickets, unreadMessages }`, two count queries for the sidebar) |
| `products`         | `list(AdminProductsQuery)`, `get(id): AdminProduct` (with `images` and a `media` map for downloads), `options(): AdminOption[]`                                             |
| `categories`       | `list(AdminListQuery)`, `get(id): AdminCategory`, `options()`, `childCount(id)`                                                                                             |
| `brands`           | `list`, `get(id): AdminBrand`, `options()`                                                                                                                                  |
| `media`            | `list(AdminMediaQuery)`, `get(id): AdminMedia`, `usages({ id, storageKey }, { ticketLabels }): AdminMediaUsage[]` (library media only; Markdown links count)                |
| `guides`           | `list(AdminListQuery & { published })`, `get(id): AdminGuide` (with a `media` map), `options()`                                                                             |
| `warrantyPolicies` | `list`, `get(id): AdminWarrantyPolicy`, `options()`, `defaultFor(months)`                                                                                                   |
| `warrantyCodes`    | `list(AdminWarrantyCodesQuery)`, `get(id): AdminWarrantyCode`, `byIds(ids)` (for the labels page), `all(query)`                                                             |
| `slides`           | `list`, `all(): AdminSlide[]` (every slide, in board order), `get(id): AdminSlide`                                                                                          |
| `tickets`          | `list(AdminTicketsQuery)`, `get(id): AdminTicket` (includes internal notes), `recent(limit)`                                                                                |
| `messages`         | `list(AdminMessagesQuery)`, `get(id): AdminContactMessage`                                                                                                                  |
| `serviceCenters`   | `list(AdminServiceCentersQuery)`, `get(id): AdminServiceCenter`                                                                                                             |
| `faqs`             | `list(AdminFaqsQuery)`, `get(id): AdminFaq`                                                                                                                                 |
| `posts`            | `list(AdminPostsQuery)`, `get(id): AdminPost`                                                                                                                               |
| `authors`          | `list`, `get(id): AdminAuthor`, `options()`                                                                                                                                 |
| `settings`         | `get(): SettingsValues` (stored values merged with defaults)                                                                                                                |
| `users`            | `list`, `get(id): AdminUser` (never exposes `passwordHash` or `totpSecret`), `assignees(): AdminOption[]`, `options(): AdminOption[]` (every user, for filters)             |
| `audit`            | `list(AdminAuditQuery): Paginated<AdminAuditLog>`, `recent(limit): AdminAuditLog[]` (no count query)                                                                        |

## Auth

- **Passwords:** argon2id via `@node-rs/argon2` with library defaults.
- **Sessions:** stored in the DB, keyed by the sha256 of a 32-byte random token. They slide 7 days from last activity, capped at 30 days from login. Expired rows are deleted whenever a new session is created.
- **Cookie:** `__Host-mandegar_sid` in production and `mandegar_sid` in development. It is `HttpOnly; SameSite=Lax; Path=/`, plus `Secure` in production, with `Max-Age` of 30 days.
- **Login:** every login issues a new token and revokes the token the browser presented.
- **Password change:** revokes every session and issues a fresh cookie.
- **Re-authentication:** the current-password checks in password change and TOTP enable/disable allow 5 failures per 15 minutes and 20 per day for each user; past that the response is `RATE_LIMITED`.
- **Lockout:** counts failed logins only, atomically, so parallel requests cannot exceed a limit. Each email and IP pair gets 5 per 15 minutes and 20 per day, and each IP gets 30 per 15 minutes. Past these the response is `RATE_LIMITED` with `Retry-After`.
- **Throttling:** failures for one email from all IPs beyond 5 per 15 minutes or 20 per day never block the account. Each further attempt for that email waits first, from 0.5 s doubling up to 5 s, so the correct password and TOTP still sign in. The first time this happens in a 15-minute window, a `login.throttled` audit entry records the targeted user.
- **No user enumeration:** unknown emails, wrong passwords and inactive users get the same `INVALID_CREDENTIALS` response. A decoy argon2 verification keeps the timing equal.
- **TOTP:** otplib v13, 6 digits and 30 seconds, with a ±1 step tolerance and replay protection. The secret is sealed with AES-256-GCM using a key derived from `SESSION_SECRET`; a secret sealed under `SESSION_SECRET_PREVIOUS` still opens and is re-sealed with the current key after the next valid code. At login, wrong codes after a correct password are capped per account, from all IPs, at 10 per 15 minutes and 50 per day (`RATE_LIMITED`). Enabling or disabling TOTP needs the current password and revokes the user's other sessions. An owner's password reset also turns TOTP off.

| Method and path               | Guard   | Body                                                                                              | Response                                                                                   |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| POST /api/auth/login          | none    | `{ email, password, totp? }`                                                                      | `{ status: "ok", user: AdminIdentity }` (sets the cookie) or `{ status: "totp-required" }` |
| POST /api/auth/logout         | none    | none                                                                                              | `{ ok: true }` (clears the cookie)                                                         |
| GET /api/auth/me              | session | none                                                                                              | `AdminIdentity`                                                                            |
| POST /api/auth/password       | session | `{ currentPassword, newPassword }`; the new password needs 12+ characters with letters and digits | `{ ok: true }` (new cookie)                                                                |
| POST /api/auth/totp/setup     | session | none                                                                                              | `{ secret, uri }`; render `uri` as a QR code with `uqr`                                    |
| POST /api/auth/totp/enable    | session | `{ password, code }`                                                                              | `{ ok: true }`                                                                             |
| POST /api/auth/totp/disable   | session | `{ password, code }`                                                                              | `{ ok: true }`                                                                             |
| GET /api/auth/sessions        | session | none                                                                                              | `AdminSession[]`                                                                           |
| DELETE /api/auth/sessions/:id | session | none                                                                                              | `{ ok: true, current: boolean }` (clears the cookie when `current`); 404 when already gone |

The form schemas are in `src/server/modules/auth/schema.ts`: `loginSchema`, `changePasswordSchema`, `passwordSchema`, `totpEnableSchema` and `totpDisableSchema`.

## Admin API

### Roles and permissions

`Permission` is defined in `src/types/admin.ts`.

| Role    | Permissions                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| owner   | every permission                                                                                                                                   |
| editor  | `dashboard:read`, `catalog:read`, `catalog:write`, `content:read`, `content:write`, `media:read`, `media:write`, `warranty:read`, `warranty:write` |
| support | `dashboard:read`, `catalog:read`, `tickets:read`, `tickets:write`, `messages:read`, `messages:write`                                               |

The other permissions are owner-only: `warranty:policies`, `settings:write`, `users:manage` and `audit:read`.

How the `can` macro works:

- Every `/api/admin/*` request is authenticated in an `onRequest` hook before its body is read, so an anonymous upload is refused without being parsed. In production, nginx also refuses `/api/admin/media` without a session cookie.
- Every admin route uses the `can: Permission` macro. It checks the permission before the body is validated. Failures return 401 `UNAUTHORIZED`, 403 `FORBIDDEN` or 403 `PASSWORD_CHANGE_REQUIRED`.
- Every successful non-GET `can` route writes an `audit_logs` row automatically:
  - `entity` is the path segment after `/admin/`, for example `products`.
  - `action` is `create`, `update` or `delete`, or the sub-path such as `images`, `generate`, `status`, `messages` or `reset-password`.
  - `entityId` is `:id` or the response `id`.
  - `diff` is the sanitized request body; keys matching `password`, `secret`, `token`, `totp` or `altcha` are redacted.
- Every content mutation calls `revalidateContent(tags, paths)` from `src/server/lib/revalidate.ts`. It expires the tags with `revalidateTag(tag, { expire: 0 })`, which the production cache handler (`src/server/cache-handler.mjs`) also stores in `cache_tag_expirations`, so restarts and new releases honour it, and which refreshes the cached data and every page, sitemap, llms file and OG image built from it, and it pings IndexNow with the paths. Services pass only paths the public can see before or after the change: published products in published categories and brands, live posts and their authors, published guides with the products that use them, and a category or brand with its products when its slug or visibility changes. Drafts, scheduled posts and the noindex compare page are never sent. Category and brand changes expire `catalog` and settings changes expire `settings`; the header and footer read both, so every page refreshes. Media alt edits expire every tag.

### Conventions

- Create bodies (`POST`) require every field.
- `PATCH` bodies accept any subset of the same fields.
- Product, category, guide and post `PATCH` bodies accept `expectedUpdatedAt`, the `updatedAt` the editor loaded. When the row has changed since, nothing is written and the response is 409 `STALE`. The admin editors always send it. Settings `PUT` bodies accept it too, checked against that section's `updatedAt`.
- A post `PATCH` whose `publishedAt` falls in the same minute as the stored time keeps the stored time, because the editor shows only minutes.
- `LocalizedText` inputs require both `fa` and `en` to be non-empty, except optional text such as descriptions, SEO and alt text, where empty strings are allowed.
- A slug or other unique clash returns 422 with `fields.<field> = "Already in use"`. A missing reference returns 422 with `"Referenced item not found"`.
- `DELETE` returns `{ id }`, or 409 `IN_USE` when other records still reference the item.

Each module's Zod input schemas are in `src/server/modules/<name>/schema.ts` and can be imported by admin forms.

| Method and path                                                     | Permission                   | Body or query                                                                                                                                           | Response                                                                                             |
| ------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET /api/admin/stats                                                | dashboard:read               | none                                                                                                                                                    | `DashboardStats`; `recentTickets` is empty without tickets:read, and `media` counts the library only |
| GET /api/admin/products                                             | catalog:read                 | `?q&page&status&categoryId&brandId`                                                                                                                     | `Paginated<AdminProductListItem>`                                                                    |
| GET /api/admin/products/options                                     | catalog:read                 | none                                                                                                                                                    | `AdminOption[]` (label = name, hint = model code)                                                    |
| GET /api/admin/products/:id                                         | catalog:read                 | none                                                                                                                                                    | `AdminProduct`                                                                                       |
| POST /api/admin/products                                            | catalog:write                | `productInputSchema`; optional `images` as for `PUT /:id/images`, written in the same transaction                                                       | `AdminProduct`                                                                                       |
| PATCH /api/admin/products/:id                                       | catalog:write                | `productPatchSchema`; `images`, when present, replaces the gallery in the same transaction                                                              | `AdminProduct`                                                                                       |
| DELETE /api/admin/products/:id                                      | catalog:write                | none                                                                                                                                                    | `{ id }`, or 409 `HAS_WARRANTY_CODES` while warranty codes exist                                     |
| PUT /api/admin/products/:id/images                                  | catalog:write                | `{ images: { mediaId, alt, isPrimary? }[] }`; array order is display order, and the first `isPrimary` (or the first image) becomes primary              | `AdminProductImage[]`                                                                                |
| GET/POST /api/admin/categories, GET/PATCH/DELETE /:id, GET /options | catalog:read / catalog:write | `categoryInputSchema` (one nesting level; deleting is refused while products or children exist)                                                         | `AdminCategory`                                                                                      |
| GET/POST /api/admin/brands, GET/PATCH/DELETE /:id, GET /options     | catalog:read / catalog:write | `brandInputSchema`                                                                                                                                      | `AdminBrand`                                                                                         |
| GET /api/admin/media                                                | media:read                   | `?q&page&kind`                                                                                                                                          | `Paginated<AdminMedia>`                                                                              |
| GET /api/admin/media/:id, GET /:id/usages                           | media:read                   | none                                                                                                                                                    | `AdminMedia`, `AdminMediaUsage[]`                                                                    |
| POST /api/admin/media                                               | media:write                  | multipart `file`, `altFa?`, `altEn?`                                                                                                                    | `AdminMedia`                                                                                         |
| PATCH /api/admin/media/:id                                          | media:write                  | `{ alt: LocalizedText }`                                                                                                                                | `AdminMedia`                                                                                         |
| DELETE /api/admin/media/:id                                         | media:write                  | none                                                                                                                                                    | `{ id }` or 409 `IN_USE` (also when Markdown in a product, category, post or FAQ links the file)     |
| GET/POST /api/admin/guides, GET/PATCH/DELETE /:id                   | content:read / content:write | `guideInputSchema`; `video` is `{ kind: "upload", mediaId, posterMediaId }`, `{ kind: "aparat", hash, posterMediaId }` or `null`                        | `AdminGuide`                                                                                         |
| GET /api/admin/guides/options                                       | catalog:read                 | none                                                                                                                                                    | `AdminOption[]`                                                                                      |
| GET /api/admin/warranty-policies, GET /:id, GET /options            | warranty:read                | `?q&page`                                                                                                                                               | `AdminWarrantyPolicy`                                                                                |
| POST, PATCH /:id, DELETE /:id on /api/admin/warranty-policies       | warranty:policies            | `warrantyPolicyInputSchema`                                                                                                                             | `AdminWarrantyPolicy` (deleting is refused while codes exist)                                        |
| GET /api/admin/warranty-codes                                       | warranty:read                | `?q&page&productId&productionYear&status&kind`                                                                                                          | `Paginated<AdminWarrantyCode>`                                                                       |
| GET /api/admin/warranty-codes/labels?ids=a,b                        | warranty:read                | at most 100 ids                                                                                                                                         | `AdminWarrantyCode[]` in the given order                                                             |
| GET /api/admin/warranty-codes/export                                | warranty:read                | same filters as the list                                                                                                                                | CSV (UTF-8 with BOM, includes the `/w/<code>` link)                                                  |
| GET /api/admin/warranty-codes/:id                                   | warranty:read                | none                                                                                                                                                    | `AdminWarrantyCode`                                                                                  |
| POST /api/admin/warranty-codes/generate                             | warranty:write               | `{ productId, productionYear, policyId?, note? }`                                                                                                       | `AdminWarrantyCode`; 409 when the product already has a batch code for that year                     |
| PATCH /api/admin/warranty-codes/:id/status                          | warranty:write               | `{ status: "active" \| "revoked" \| "recalled", note? }`                                                                                                | `AdminWarrantyCode`                                                                                  |
| GET/POST /api/admin/slides, GET/PATCH/DELETE /:id                   | content:read / content:write | `slideInputSchema`; `ctaHref` is an unlocalized path or an https URL, and dates are ISO strings                                                         | `AdminSlide`                                                                                         |
| PUT /api/admin/slides/order                                         | content:write                | `{ ids: string[] }`, distinct slide ids in display order; each gets `sortOrder` index × 10 in one transaction                                           | `{ ids }`                                                                                            |
| GET /api/admin/tickets                                              | tickets:read                 | `?q&page&type&status&priority&assigneeId&breaching=true&open=true`                                                                                      | `Paginated<AdminTicketListItem>`, urgent first                                                       |
| GET /api/admin/tickets/:id                                          | tickets:read                 | none                                                                                                                                                    | `AdminTicket` (includes internal notes)                                                              |
| GET /api/admin/tickets/:id/attachments/:mediaId                     | tickets:read                 | none                                                                                                                                                    | the file, for any attachment of that ticket                                                          |
| PATCH /api/admin/tickets/:id                                        | tickets:write                | `{ status?, priority?, assigneeId? }`                                                                                                                   | `AdminTicket`                                                                                        |
| POST /api/admin/tickets/:id/messages                                | tickets:write                | JSON `{ body, internal, status? }`, or multipart `body`, `internal` (`"true"`/`"false"`), optional `status` and `attachments` (ticket attachment rules) | `AdminTicket`                                                                                        |
| GET /api/admin/messages, GET /:id                                   | messages:read                | `?q&page&status&department`                                                                                                                             | `AdminContactMessage`                                                                                |
| PATCH /api/admin/messages/:id, DELETE /:id                          | messages:write               | `{ status: "new" \| "read" \| "archived" }`                                                                                                             | `AdminContactMessage`                                                                                |
| GET/POST /api/admin/service-centers, GET/PATCH/DELETE /:id          | content:read / content:write | `serviceCenterInputSchema` (`?province&kind` filters)                                                                                                   | `AdminServiceCenter`                                                                                 |
| GET/POST /api/admin/faqs, GET/PATCH/DELETE /:id                     | content:read / content:write | `faqInputSchema` (`?group`)                                                                                                                             | `AdminFaq`                                                                                           |
| GET/POST /api/admin/posts, GET/PATCH/DELETE /:id                    | content:read / content:write | `postInputSchema` (`?kind&status&authorId`); a published post saved with no date (missing, `null` or blank in the editor) is dated now                  | `AdminPost`                                                                                          |
| GET/POST /api/admin/authors, GET/PATCH/DELETE /:id, GET /options    | content:read / content:write | `authorInputSchema` (deleting is refused while posts exist)                                                                                             | `AdminAuthor`                                                                                        |
| GET /api/admin/settings                                             | settings:write               | none                                                                                                                                                    | `SettingsValues`                                                                                     |
| GET /api/admin/settings/contact, /seo, /stats, /company             | settings:write               | none                                                                                                                                                    | `{ value, updatedAt }` for that section                                                              |
| PUT /api/admin/settings/contact, /seo, /stats, /company             | settings:write               | the matching schema from `modules/settings/schema.ts` and `expectedUpdatedAt`; `contact.location` is `{ lat, lng }` inside Iran or `null`               | `{ value, updatedAt }`                                                                               |
| GET /api/admin/users, GET /:id                                      | users:manage                 | `?q&page`                                                                                                                                               | `AdminUser`                                                                                          |
| GET /api/admin/users/assignees                                      | tickets:read                 | none                                                                                                                                                    | `AdminOption[]` (active users who can work tickets)                                                  |
| POST /api/admin/users                                               | users:manage                 | `{ name, email, role }`                                                                                                                                 | `{ user: AdminUser, temporaryPassword }`; the user must change it on first login                     |
| PATCH /api/admin/users/:id                                          | users:manage                 | `{ name?, role?, active? }` with at least one field; you cannot demote or deactivate yourself or the last owner                                         | `AdminUser`; deactivating or losing tickets:write unassigns the user's open tickets                  |
| POST /api/admin/users/:id/reset-password                            | users:manage                 | none                                                                                                                                                    | `{ id, temporaryPassword }` (revokes that user's sessions and turns TOTP off)                        |
| GET /api/admin/audit                                                | audit:read                   | `?q&page&entity&action&actorId`                                                                                                                         | `Paginated<AdminAuditLog>`                                                                           |

### Ticket rules

- **SLA due dates:** set at creation. First response is due in 1 business day. Resolution is due in 7 business days for warranty-repair, 10 for repair, 5 for spare-parts, 2 for technical, 3 for complaint and 10 for suggestion. Business days skip Friday, using Asia/Tehran time.
- **Breaching:** an open ticket whose first response or resolution is overdue.
- **Staff replies:** the first non-internal reply sets `firstRespondedAt` and moves `new` to `in-review`. Staff can attach up to 5 files with the same rules as customers (jpg/png/webp/pdf, 5 MB each, images re-encoded). Attachments on public replies appear in `PublicTicket.messages[].attachments`; internal notes and their files never do.
- **Status changes:** setting `resolved` stamps `resolvedAt`, and `closed` or `rejected` stamps `closedAt`. Each change adds a public system message whose body is `status:<TicketStatus>`; render it as a localized status event.
- **SMS:** the customer gets one on creation (`ticket-received`), and one per staff reply or status change (`ticket-updated`, with the tracking code and the Persian status label); a reply sent with a `status` sends a single SMS.

## Media and uploads

- **Images:** jpg, png, webp and avif up to 15 MB. They are re-encoded with sharp: auto-oriented, metadata stripped, at most 2400 px, and saved as webp at quality 80. Width, height and sha256 are stored, and identical uploads are deduplicated by sha256.
- **Video and documents:** mp4 and webm up to 200 MB; pdf up to 30 MB.
- **Type checks:** done by magic bytes with `file-type`. SVG is always rejected.
- **Scopes:** `media.scope` is `library` for admin uploads and `ticket` for ticket attachments. Only library media appear in `/api/admin/media`, can be picked for content, and are deduplicated by sha256. Ticket attachments are never deduplicated and are stored privately.
- **Storage keys:** `YYYY/MM/<ulid>.<ext>` for library media and `private/YYYY/MM/<ulid>.<ext>` for ticket attachments, written by the storage driver.
  - The `local` driver writes under `UPLOAD_DIR`.
  - The `s3` driver is used when `STORAGE_DRIVER=s3` and the `S3_*` variables are set. It loads `@aws-sdk/client-s3` lazily, with path-style addressing for ArvanCloud. A missing key (`NoSuchKey`) reads as not found and an unsatisfiable range as a 416; any other bucket error is thrown and logged as a 500. AWS answers `AccessDenied` instead of `NoSuchKey` when the key lacks `s3:ListBucket`, so grant it or missing media turns into 500s.
- **Serving:** `GET /uploads/<key>` streams library media through the driver and returns 404 for `private/` keys.
  - Paths are strictly validated: no dot segments or hidden files, and only known extensions.
  - It supports `Range` (206 and 416) for video.
  - Headers are `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`, and `Content-Disposition: inline` for pdf.
- **Ticket attachments:** staff open them at `GET /api/admin/tickets/:id/attachments/:mediaId` (`tickets:read`). Customers get signed links, `GET /api/tickets/attachments/:mediaId?expires=&signature=`, valid for at least 12 hours and only for files on public messages. Both send `Cache-Control: private, no-store`; images are inline and PDFs download.
- **Warranty short links:** `GET /w/<code>` returns a 308 redirect to `/warranty?code=<normalized>`.

## Operations

| Command            | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:generate` | Generate SQL in `drizzle/`. `0000_extensions.sql` creates `pg_trgm`.                                                                                                                                                                                                                                                                                                                                                                                    |
| `pnpm db:migrate`  | Apply migrations.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm db:seed`     | Idempotent seed that fills only empty content tables. Needs `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD` (12+ characters). Always creates the owner, warranty policies and settings; placeholder catalog and content follow when `SEED_DEMO=true`, or by default on a local stack (`APP_ORIGIN` on `localhost`, `NODE_ENV` not `production`), and demo warranty codes and tickets only on a local stack. Photos are cached in `UPLOAD_DIR/.seed-cache`. |
| `pnpm test`        | Unit tests and app integration tests through `app.handle`, against `DATABASE_URL`.                                                                                                                                                                                                                                                                                                                                                                      |

Environment variables beyond `src/config/env.ts` are read in `src/server/env.ts`:

- storage: `STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`;
- ALTCHA: `ALTCHA_COST`;
- SMS: `SMS_DRIVER` (`console`, `kavenegar` or `none`; default `console`), `KAVENEGAR_API_KEY`, `KAVENEGAR_TEMPLATE_TICKET_RECEIVED`, `KAVENEGAR_TEMPLATE_TICKET_UPDATED`.

Every notification attempt is recorded in `notification_outbox`.
