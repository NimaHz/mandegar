# Backend reference

Elysia runs inside Next at `src/app/api/[[...slugs]]/route.ts` with the prefix `/api`. Server components read data through `api` (`src/services/index.ts`, server-only). Client components call `/api` through the Eden client `apiClient` (`src/lib/api-client.ts`).

Every error response has this shape:

```json
{ "error": { "code": "VALIDATION", "message": "Invalid request", "fields": { "phone": "Invalid mobile number" } } }
```

`fields` is present only for `VALIDATION` (422). The codes are:

| Code | Status | Meaning |
| --- | --- | --- |
| `BAD_REQUEST` | 400 | Malformed body or parameters |
| `VALIDATION` | 422 | Invalid input; `fields` maps each field path to its message |
| `SPAM_REJECTED` | 400 | Honeypot filled, or the form token is too fresh, expired or invalid |
| `CHALLENGE_FAILED` | 403 | ALTCHA payload missing, invalid, expired or already used |
| `ORIGIN_REJECTED` | 403 | A non-GET request came from a foreign `Origin` |
| `UNAUTHORIZED` | 401 | No valid session |
| `INVALID_CREDENTIALS` | 401 | Login failed; the same response whatever the reason |
| `PASSWORD_CHANGE_REQUIRED` | 403 | The user must change a temporary password first |
| `FORBIDDEN` | 403 | The role lacks the permission |
| `NOT_FOUND` | 404 | Missing resource, or a ticket that cannot be matched |
| `CONFLICT` | 409 | Unique clash or invalid state |
| `IN_USE` | 409 | The item is still referenced, for example media or a category |
| `LIMIT_REACHED` | 409 | Business limit reached, for example 3 open tickets per phone |
| `LENGTH_REQUIRED` | 411 | Chunked body sent without `Content-Length` |
| `PAYLOAD_TOO_LARGE` | 413 | The body or a file is too big |
| `UNSUPPORTED_MEDIA` | 415 | The file type is not allowed (checked by magic bytes) |
| `RATE_LIMITED` | 429 | Too many requests; the `Retry-After` header is set |
| `INTERNAL` | 500 | Unexpected error; no stack in production |

Security rules for every request:

- Non-GET requests must send `Origin` equal to `APP_ORIGIN`, or `Sec-Fetch-Site: same-origin` when there is no `Origin`.
- Bodies are capped at 1 MB. The caps are 30 MB for `POST /api/tickets` and ticket replies, and 210 MB for `POST /api/admin/media`.
- The client IP is read from `X-Real-IP`, then the first `X-Forwarded-For` entry. It is hashed with HMAC(`SESSION_SECRET`) into a `clientKey` used for rate limits. The reverse proxy must set these headers.
- API responses send `Cache-Control: no-store`.

## Public endpoints

`locale` is `"fa" | "en"` and defaults to `"fa"` when it is missing or invalid.

### GET /api/health

Returns `{ status: "ok" | "degraded", database: boolean, time: string }`. The status code is 503 when the database is down.

### GET /api/search?q=&locale=

Rate limit: 60 per minute per IP. Returns `{ hits: SearchHit[] }` (`src/types/catalog.ts`), at most 8 hits.

- `href` is already localized: `/products/x` for fa, `/en/products/x` for en.
- An empty `q`, or one shorter than 2 characters after normalization, returns `{ hits: [] }`.
- Matching ignores Arabic/Persian letter variants, ZWNJ, spaces, hyphens and Persian digits, so `mc45`, `MC 4500` and `MC-4500` all find the MC-4500, and `فن هیتر` finds `فن‌هیتر`. A trigram fallback catches small typos in longer queries.
- Hit order is products (up to 5), categories (2), guides (2) and posts (2), then any remaining hits.

### POST /api/warranty/lookup

Body: `{ code: string, locale?: Locale }`. Returns `WarrantyLookup` (`src/types/warranty.ts`) with status 200 in every case:

- `{ status: "found", match }`. `match.code` is formatted, for example `W5K-3M9-XT0`, and `match.status` can be `active`, `revoked` or `recalled`.
- `{ status: "not-found" }`. Every miss gets this identical object.
- `{ status: "invalid", reason: "empty" | "length" | "prefix" | "check" }`.
- `{ status: "rate-limited" }`, after 10 failed lookups per minute or 50 per day per IP.

Input is normalized server-side: Persian digits, Persian keyboard letters, lowercase, dashes and O/I/L are all accepted. Validate client-side first with `parseWarrantyCode` from `src/lib/warranty-code.ts`. Lookups for archived (discontinued) products still resolve; drafts never do.

### GET /api/tickets/form-token

Rate limit: 60 per minute. Returns `{ token: string }`, an HMAC-signed timestamp. Fetch it when the form mounts. A submission is rejected (`SPAM_REJECTED`) if it arrives less than 3 seconds or more than 2 hours after the token was issued. The contact form uses this endpoint too.

### GET /api/altcha/challenge

Rate limit: 60 per minute. Returns the altcha-lib v2 `Challenge` JSON exactly as `createChallenge` produces it:

```ts
{ parameters: { algorithm: "PBKDF2/SHA-256", nonce, salt, cost: 5000, keyLength: 32, keyPrefix, keySignature, expiresAt, ... }, signature: string }
```

The challenge expires after 10 minutes. The counter is a random value between 5000 and 10000. The HMAC keys are derived from `SESSION_SECRET`.

To solve and send it from the client:

```ts
import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";

const challenge = await (await fetch("/api/altcha/challenge")).json();
const solution = await solveChallenge({ challenge, deriveKey });
const altcha = btoa(JSON.stringify({ challenge, solution }));
```

Send `altcha` as a multipart field named `altcha` (tickets) or as the string property `altcha` in a JSON body (contact). The server decodes the base64 JSON, runs `verifySolution`, and records the challenge signature for one hour. A replayed payload therefore fails with `CHALLENGE_FAILED`, so fetch a new challenge for every submission, including after an error.

### POST /api/tickets (multipart/form-data)

| Field | Rule |
| --- | --- |
| `type` | `TicketType` |
| `name` | 2–80 characters |
| `phone` | Iranian mobile in any format (normalized to `09XXXXXXXXX`) |
| `email` | optional email |
| `province` | province code from `src/lib/provinces.ts`, for example `"23"` |
| `city` | 2–60 characters |
| `address` | 5–300 characters |
| `warrantyCode` | optional; must pass the check symbol if present; links the ticket to the code and its product |
| `productSlug` | optional; used when there is no warranty code |
| `purchaseDate` | optional `YYYY-MM-DD` (Gregorian) |
| `subject` | 3–120 characters |
| `description` | 10–3000 characters |
| `website` | honeypot; keep it hidden and empty |
| `formToken` | from `GET /api/tickets/form-token` |
| `altcha` | the base64 payload described above |
| `locale` | optional |
| `attachments` | 0–5 files (repeat the field), jpg/png/webp/pdf, 5 MB each; images are re-encoded to webp and metadata is stripped |

The same field rules are exported as `ticketFieldsSchema` from `src/server/modules/tickets/schema.ts` for react-hook-form, along with `TICKET_ATTACHMENT_LIMIT`, `TICKET_ATTACHMENT_MAX_BYTES`, `ticketAttachmentTypes` and `mentionsGasSmell(text)`.

Returns `TicketReceipt`: `{ trackingCode: "T5K3M9XT0", accessToken: string, urgent: boolean }`.

- `trackingCode` is raw. Display it with `formatTrackingCode`.
- Build the private tracking link as `/support/track?t=<accessToken>`. The token is shown only once.
- `urgent` is true when the subject or description mentions «بوی گاز» or "gas smell". Show the safety notice (close the valve, call 194).

Other limits:

- 5 tickets per hour per IP (`RATE_LIMITED`).
- At most 3 open tickets per phone (`LIMIT_REACHED`).

### POST /api/tickets/track

Body: `{ trackingCode, phone, locale? }` or `{ token, locale? }`. Returns `PublicTicket` (`src/types/support.ts`):

- The phone is masked as `0912***4567`.
- The address is never included, and internal notes are excluded.
- `canReply` is true only when the ticket was opened with the token and is not closed or rejected.

A ticket that cannot be matched returns 404 `NOT_FOUND`. After 20 misses in 10 minutes per IP the response is `RATE_LIMITED`.

### POST /api/tickets/:trackingCode/messages (multipart/form-data)

Fields:

- `token` (required): the access token;
- `body`: 1–3000 characters;
- `locale`: optional;
- `attachments`: same rules as for creation.

Returns the updated `PublicTicket`. A wrong token or tracking code returns 404. A closed ticket returns 409. The rate limit is 20 per hour per IP. A reply moves `awaiting-customer` tickets back to `in-review`.

### POST /api/contact (JSON)

Body: `{ department, name, phone, email?, subject, body, website?, formToken, altcha }`.

- `department` is a `ContactDepartment`.
- `subject` is 3–120 characters and `body` is 10–3000.

The rate limit is 5 per hour per IP. Returns `{ received: true }`. The form field rules are exported as `contactSchema` (with input type `ContactInput`) from `src/server/modules/contact/schema.ts`. `contactRequestSchema` adds the three anti-spam fields.

## Calling the API from client components (Eden)

`src/lib/api-client.ts` exports `apiClient = treaty<App>(origin, { fetch: { credentials: "include" } })`. Paths mirror the URL, starting with `.api`:

```tsx
"use client";

import { apiClient } from "@/lib/api-client";

const { data, error } = await apiClient.api.warranty.lookup.post({ code, locale });
if (error) {
  const code = (error.value as { error?: { code?: string } }).error?.code;
}

const search = await apiClient.api.search.get({ query: { q, locale } });

const receipt = await apiClient.api.tickets.post({
  ...fields,
  formToken,
  altcha,
  attachments: files,
});

const ticket = await apiClient.api.tickets({ trackingCode }).messages.post({ token, body });
```

- `data` is fully typed from the Elysia route.
- `error.status` holds the HTTP status, and `error.value` holds the `{ error: { code, message, fields? } }` body.
- File fields accept `File` or `File[]`, and Eden sends multipart automatically when a body contains files.
- The client is same-origin and always sends cookies.
