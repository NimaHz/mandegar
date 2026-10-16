# SEO, AEO and GEO

How Mandegar is described to search engines, answer engines and LLM crawlers. Everything here is generated from the database, so editors never touch markup.

## Ground rules

- Structured data describes only what a visitor can see on the page. If a FAQ, a step or a spec is not rendered, it is not in the JSON-LD.
- Every public page renders exactly one `<script type="application/ld+json">` holding one `@graph`. Nodes link to each other by `@id`.
- JSON-LD uses absolute URLs, ASCII digits (Persian digits are converted), ISO 8601 dates with the Tehran offset (`2026-10-15T17:37:31+03:30`; Iran has no DST since 2022) and `inLanguage` `fa-IR` or `en`.
- Google facts for 2026 that shape the markup:
  - FAQ rich results were removed in May 2026 and HowTo results ended in 2023. `FAQPage` and `HowTo` stay only where the questions or steps are visible: other engines and LLMs still read them.
  - Speakable is US-English news only, so it is not used.
  - The sitelinks search box is retired. `WebSite` has no `SearchAction`.
  - Mandegar publishes no prices. A Product rich result needs `offers`, `review` or `aggregateRating`, and Google flags price-less offers, so Product nodes have **no** `offers`. They still help entity understanding in Google, Bing and LLMs.
  - `warranty` is valid only on `Offer`/`Demand`. The warranty is a Product `additionalProperty` (`PropertyValue`, name «گارانتی»/"Warranty", value in months, `unitCode` `MON`); after-sales support is a separate Organization-provided `Service` node on the support page.
- Search in Iran is about 99% Google. Bing matters because Copilot and ChatGPT search use its index; IndexNow keeps Bing and Yandex fresh.

## Code map

| Path                                                               | Role                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/seo/metadata.ts`                                          | `pageMetadata()` for every page: title (≤ 60 chars with the site suffix), description (≤ 155), canonical, `hreflang` (`fa-IR`, `en`, `x-default`), Open Graph, Twitter card, OG image, `noindex` |
| `src/lib/seo/urls.ts`                                              | `siteUrl`, `absoluteUrl()`, `localeUrl()`                                                                                                                                                        |
| `src/lib/seo/text.ts`                                              | `tehranIso()`, `isoDuration()`, `plainText()` (markdown to text), `truncate()`                                                                                                                   |
| `src/lib/seo/jsonld/*.ts`                                          | Pure node builders (below)                                                                                                                                                                       |
| `src/lib/seo/jsonld/graph.ts`                                      | `buildGraph()`: drops empty values, converts digits, merges nodes with the same `@id`                                                                                                            |
| `src/lib/seo/graph.ts`                                             | `pageGraph(locale, nodes)`: adds the site-wide Organization, Brand and WebSite nodes (server-only, cached per request)                                                                           |
| `src/lib/seo/graphs.ts`                                            | One composer per page type, used by the pages                                                                                                                                                    |
| `src/lib/seo/answers.ts`                                           | Answer-first copy generated from data: the product summary sentence and the category "how to choose" questions                                                                                   |
| `src/lib/seo/content.ts`                                           | SEO-only copy (warranty property labels, service names, OG chips, answer templates)                                                                                                              |
| `src/components/seo/json-ld.tsx`                                   | `<JsonLd data>`; escapes `<`, U+2028 and U+2029                                                                                                                                                  |
| `src/lib/seo/og/*`                                                 | OG image targets, template, renderer and data loader                                                                                                                                             |
| `src/app/og/[...slug]/route.ts`                                    | OG image endpoint                                                                                                                                                                                |
| `src/lib/seo/snapshot.ts`                                          | One cached read of every public entity in both locales, shared by sitemaps and llms files                                                                                                        |
| `src/lib/seo/sitemaps.ts`, `sitemap-xml.ts`                        | Sitemap entries and XML                                                                                                                                                                          |
| `src/app/sitemap.xml/route.ts`, `src/app/sitemaps/[name]/route.ts` | Sitemap index and per-type sitemaps                                                                                                                                                              |
| `src/app/robots.ts`                                                | robots.txt                                                                                                                                                                                       |
| `src/lib/seo/llms.ts`, `src/app/llms.txt`, `src/app/llms-full.txt` | LLM-oriented summaries                                                                                                                                                                           |
| `src/lib/seo/feed.ts`, `src/app/feeds/[name]/route.ts`             | Blog RSS feeds, one per language                                                                                                                                                                 |
| `src/server/lib/indexnow.ts`                                       | IndexNow ping, called from `revalidateContent()` in `src/server/lib/revalidate.ts`                                                                                                               |
| `scripts/validate-jsonld.mjs`                                      | Validator for JSON-LD, metadata and the SEO endpoints                                                                                                                                            |

## `@id` scheme

| Node                         | `@id`                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| Organization                 | `${site}/#organization`                                                    |
| Own brand (Mandegar)         | `${site}/#brand`                                                           |
| Logo                         | `${site}/#logo`                                                            |
| WebSite                      | `${home}#website` (`${site}/#website` for fa, `${site}/en#website` for en) |
| Warranty service             | `${site}/#warranty-service`                                                |
| After-sales service          | `${site}/#after-sales-service`                                             |
| Any page                     | `${url}#webpage`                                                           |
| Breadcrumb                   | `${url}#breadcrumb`                                                        |
| Product                      | `${productUrl}#product`                                                    |
| Partner brand                | `${brandUrl}#brand`                                                        |
| Item list                    | `${url}#itemlist`                                                          |
| FAQ block                    | `${url}#faq`                                                               |
| Guide article, how-to, video | `${guideUrl}#article`, `#howto`, `#video`                                  |
| Blog                         | `${blogUrl}#blog`                                                          |
| Post                         | `${postUrl}#article`                                                       |
| Author                       | `${authorUrl}#person`                                                      |
| Service centre               | `${serviceCentersUrl}#center-${slug}`                                      |

`site` is `NEXT_PUBLIC_SITE_URL`. References to nodes that are not in the page graph are written as small inline definitions (type, name, url), so every reference resolves inside the page.

## Graph per page

| Page            | Nodes (plus Organization, Brand, WebSite on every page)                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home            | WebPage, ItemList of featured models                                                                                                                                     |
| Products        | CollectionPage, ItemList                                                                                                                                                 |
| Category        | CollectionPage, ItemList, BreadcrumbList, FAQPage for the visible "how to choose" answers                                                                                |
| Product         | ItemPage, Product (specs and warranty as `additionalProperty` with UN/CEFACT `unitCode`, `isRelatedTo`, `subjectOf` the guide), BreadcrumbList, FAQPage for product FAQs |
| Brands, brand   | CollectionPage `about` the Brand (Mandegar points at the site-wide `/#brand`), ItemList                                                                                  |
| Compare         | none (`noindex`)                                                                                                                                                         |
| Warranty        | WebPage, warranty Service, FAQPage for warranty FAQs                                                                                                                     |
| Support         | WebPage, after-sales Service                                                                                                                                             |
| Guides          | CollectionPage, ItemList                                                                                                                                                 |
| Guide           | WebPage, TechArticle, HowTo (steps, tools), VideoObject when a video exists (`Clip` chapters with `?t=` links for uploaded videos), BreadcrumbList                       |
| Service centres | CollectionPage, ItemList of LocalBusiness (service) and Store (dealer) with address, phone, geo, `openingHoursSpecification`, `parentOrganization`                       |
| Blog            | CollectionPage, Blog                                                                                                                                                     |
| Post            | WebPage, BlogPosting (author Person, publisher, dates, image, `about` the related products), BreadcrumbList                                                              |
| Author          | ProfilePage, Person                                                                                                                                                      |
| About           | AboutPage, Organization                                                                                                                                                  |
| Contact         | ContactPage, Organization contact points                                                                                                                                 |
| FAQ             | FAQPage                                                                                                                                                                  |

## Metadata

- `pageMetadata({ locale, path, title, description, og?, image?, type?, noindex? })`. Titles longer than 60 characters with the ` | ماندگار` suffix are emitted as absolute titles. Descriptions longer than 155 characters keep whole sentences when that fills most of the budget, otherwise they are cut on a word boundary. A blank title or description is left out, so the defaults from the admin SEO settings apply.
- `noindex` pages: compare, track, offline, searched, filtered or sorted product and category listings (any `/products?category=`), guides filtered by category, blog filtered by kind, and service centres filtered by province or kind. They keep `follow` and point their canonical at the unfiltered listing. `/products?category=` points at the category page only when that published category exists, and its JSON-LD and OG image follow the same target.
- Pagination of products, categories and the blog is indexable with a self-referencing canonical (`?page=N`). A page past the last one returns not found.
- `notFound()` inside `[locale]` renders `[locale]/not-found.tsx`. Unmatched URLs render `global-not-found.tsx` in the visitor's locale, which the proxy passes in the `x-locale` request header. Both carry only the `noindex` robots tag that Next adds.
- Warranty results (`?code=`) render no JSON-LD.
- The root layout sets `metadataBase`, the default title and description from the admin SEO settings, `applicationName`, `formatDetection`, icons, the manifest, `googleBot` snippet limits (`max-image-preview: large`, `max-snippet: -1`, `max-video-preview: -1`) and verification tags from `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` when they are set.

## OG images

- URL: `/og/{locale}/{kind}/{slug}.png?v={version}`. Kinds: `page` (static pages, keyed by path), `product`, `category`, `brand`, `guide`, `post`, `author`. `pageMetadata` picks the page card automatically; detail pages pass `og: await ogEntityTarget(locale, kind, slug)` (`src/lib/seo/og/cards.ts`), whose version is a hash of what the card shows (title, kicker, subtitle, model code, counts and image), so any visible change, including a gallery, category name or product count change, gives a new URL.
- Responses are 1200×630 PNG with `Cache-Control: public, max-age=31536000, immutable`. Unknown targets return 404, so the endpoint cannot be used to render arbitrary text. A request whose query is not exactly the current `?v=` gets a 308 to the canonical URL with `Cache-Control: no-store`, so stale or made-up versions never render or fill the image cache.
- Rendering uses `satori` (pinned `0.60.0`) and `@resvg/resvg-js` (pinned `2.6.2`) on the Node runtime. `next/og` in Next 16.4 bundles Satori 0.29, which cannot shape Persian; Satori 0.48+ shapes Arabic script with HarfBuzz and supports `direction: rtl`.
- Fonts: static Vazirmatn TTFs in `src/assets/fonts/vazirmatn/static` (Satori cannot read the variable WOFF2) and the Kufam wordmark TTF in `src/assets/fonts/kufam/static`. `next.config.ts` lists `@resvg/resvg-js` in `serverExternalPackages` (it is a native addon) and traces the fonts into the standalone build with `outputFileTracingIncludes`.
- Images come from the storage driver and are re-encoded with sharp, so the renderer never fetches over the network.
- Satori quirk: padding is added outside fixed `width`/`height`, so padded containers use flex growth instead of fixed sizes.

## Answer-first content

- Product pages open with one generated sentence under the tagline: name, brand, category, the first key figure and the warranty months (for example «کولر آبی سلولزی MC-4500 مدلی از ماندگار در دسته کولر آبی با هوادهی ۴٬۵۰۰ متر مکعب بر ساعت است و ۱۸ ماه گارانتی رسمی دارد.»), followed by a «آخرین به‌روزرسانی» `<time>`.
- Category pages prepend two generated questions to their visible FAQ: how to choose (the key figure every model shares, per model) and which models exist (with the warranty range). They feed the category `FAQPage` node.
- Guides and posts show their last update in a `<time datetime>` element.
- Every FAQ answer is in the HTML (`<details>`), so the `FAQPage` text always matches the page.

## Sitemaps

- `/sitemap.xml` is an index of `/sitemaps/{pages,categories,products,brands,guides,posts,authors,service-centers}.xml`.
- Each URL is listed once per locale with `xhtml:link` alternates for `fa-IR`, `en` and `x-default`. `lastmod` comes from `updatedAt`: listing pages use their newest item; warranty, support, FAQ, contact, about, request and service-centre pages use their FAQs, warranty policies, settings or centres; terms and privacy use `src/config/content-dates.ts`. Every URL and every index row carries one.
- Products, categories, brands, guides, posts and authors carry `image:image`. Guides with a video carry `video:video` (thumbnail, title, description, `content_loc` for uploads or `player_loc` for Aparat, duration, publication date).
- Everything is cached for an hour, and admin edits expire it through the cache tags in `revalidateContent()`.

## robots.txt

Allows everything by default and names the search and AI crawlers explicitly (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, Perplexity-User, Applebot, Applebot-Extended, Google-Extended, CCBot). Every group disallows only `/admin`, `/api/` and `/w/`. Utility, filtered and paginated pages stay crawlable so crawlers can read their `noindex` and canonical. Bytespider is blocked. The file lists the sitemap index.

## llms.txt and llms-full.txt

- `/llms.txt`: name, bilingual summary, then sections for products by category (every model), support and warranty, guides, company, and posts under `Optional`. Every link is absolute and given in English and Persian.
- `/llms-full.txt`: plain-text facts per model in both languages (name, model code, category, brand, summary, key facts, every spec with its unit, warranty months, guide link, FAQs), then support facts: how warranty codes work, how to request and track service, the gas-smell safety rule, hours, phones, emails, address, warranty policies, every service centre and the general FAQs.

## RSS feeds

- `/feeds/blog-fa.xml` and `/feeds/blog-en.xml` (`src/app/feeds/[name]/route.ts`, `src/lib/seo/feed.ts`) are RSS 2.0 feeds of the 30 newest live posts per language: title, link, permalink `guid`, `pubDate`, excerpt, author (`dc:creator`), kind and the cover image (`media:content`), with an `atom:link` self link.
- Every page made with `pageMetadata` advertises its language's feed with `<link rel="alternate" type="application/rss+xml">`, and `/llms.txt` lists both feeds.
- They are built from the same snapshot as the sitemaps, cached for an hour and expired by the same cache tags when posts change.

## IndexNow

- Env: `INDEXNOW_KEY` (8–128 letters, digits or dashes) and `INDEXNOW_ENABLED=true` in production. Pings are a no-op otherwise.
- The key must be served at `/{key}.txt`. Put a file named `{key}.txt` containing only the key in `public/`. The dev key lives in `.env.local` and `public/`. To rotate, generate a new key (`openssl rand -hex 16`), replace the file and the env value, then redeploy.
- `revalidateContent(tags, paths)` (`src/server/lib/revalidate.ts`) hands the changed paths to `pingIndexNowPaths` (`src/server/lib/indexnow.ts`), which posts the absolute fa and en URLs to `https://api.indexnow.org/indexnow` in the background. Pings never throw and time out after 5 seconds.

## Validation

```bash
node scripts/validate-jsonld.mjs                 # home, first product, category, guide, post and service centres in both locales
node scripts/validate-jsonld.mjs /about /en/faq  # specific paths
SITE_ORIGIN=https://mandegar.ir node scripts/validate-jsonld.mjs
```

The script checks that each page has one JSON-LD block that parses, one `#webpage` node, resolvable `@id` references, required properties per type (typed references to other pages must carry a smaller stub set, and any other type its full set), absolute URLs, `+03:30` dates, ASCII digits and valid `inLanguage`; it spot-checks that names, headlines, questions, steps, list items and service centres appear in the visible text; and it checks the title and description length, canonical, `hreflang`, Open Graph and Twitter tags, that the OG image returns a PNG, and that `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/llms-full.txt` respond. It exits non-zero on any error.

Also useful before launch: `xmllint --noout` on each sitemap, Google's Rich Results Test and the Schema Markup Validator on a product, a guide and a post, and URL inspection in Search Console and Bing Webmaster Tools.

## Launch checklist

- Set `NEXT_PUBLIC_SITE_URL` to the production origin before building: canonical URLs, `@id`s, sitemaps and OG URLs all derive from it.
- Set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`, verify both properties, and submit `/sitemap.xml` in each.
- Set `INDEXNOW_KEY`, add `public/{key}.txt`, and set `INDEXNOW_ENABLED=true`.
- Fill the company settings (legal name, national ID, registration number, socials) in the admin: they feed `Organization.legalName`, `identifier`, `taxID` and `sameAs`.
