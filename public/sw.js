const VERSION = "mandegar-v2";
const PRECACHE = `${VERSION}-precache`;
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const MEDIA = `${VERSION}-media`;

const OFFLINE_PAGES = { fa: "/offline", en: "/en/offline" };
const PRECACHE_URLS = [
  OFFLINE_PAGES.fa,
  OFFLINE_PAGES.en,
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const NETWORK_TIMEOUT_MS = 3000;
const LIMITS = { [PAGES]: 40, [STATIC]: 300, [MEDIA]: 200 };
const BYPASS = /^\/(?:api|admin)(?:\/|$)/;
const UNSTORABLE = /(?:^|,)\s*(?:no-store|private)\b/i;
const STATIC_REFERENCE = /\/_next\/static\/[^"'\\\s)]+/g;

const trim = async (name) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const excess = keys.length - LIMITS[name];
  if (excess > 0) await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
};

const store = async (name, request, response) => {
  const cache = await caches.open(name);
  await cache.put(request, response);
  await trim(name);
};

const cacheable = (response) => response.ok && response.type === "basic";

const storablePage = (url, response) =>
  !url.search &&
  cacheable(response) &&
  !UNSTORABLE.test(response.headers.get("cache-control") ?? "");

const precacheOfflineAssets = async (cache) => {
  const pages = await Promise.all(
    Object.values(OFFLINE_PAGES).map((url) => cache.match(url).then((hit) => hit?.text() ?? "")),
  );
  const assets = new Set(pages.flatMap((html) => html.match(STATIC_REFERENCE) ?? []));
  const staticCache = await caches.open(STATIC);
  await Promise.all([...assets].map((url) => staticCache.add(url).catch(() => undefined)));
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then(async (cache) => {
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      await precacheOfflineAssets(cache);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(`${VERSION}-`)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

const offlinePageFor = (url) =>
  url.pathname === "/en" || url.pathname.startsWith("/en/") ? OFFLINE_PAGES.en : OFFLINE_PAGES.fa;

const cachedPage = (request) => caches.match(request, { ignoreVary: true });

const navigate = async (event, url) => {
  const { request } = event;
  const network = fetch(request);
  event.waitUntil(
    network
      .then((response) =>
        storablePage(url, response) ? store(PAGES, request, response.clone()) : undefined,
      )
      .catch(() => undefined),
  );
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));

  try {
    const first = await Promise.race([network, timeout]);
    if (first) return first;
    return (await cachedPage(request)) ?? (await network);
  } catch {
    return (
      (await cachedPage(request)) ?? (await caches.match(offlinePageFor(url))) ?? Response.error()
    );
  }
};

const cacheFirst = async (event, name) => {
  const { request } = event;
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (cacheable(response)) event.waitUntil(store(name, request, response.clone()));
  return response;
};

const isMedia = (url) =>
  url.pathname.startsWith("/uploads/") ||
  (url.pathname === "/_next/image" && (url.searchParams.get("url") ?? "").startsWith("/uploads/"));

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/brand/") ||
  url.pathname === "/icon.svg";

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || BYPASS.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(navigate(event, url));
    return;
  }

  if (request.headers.has("range")) return;
  if (isMedia(url)) event.respondWith(cacheFirst(event, MEDIA));
  else if (isStatic(url)) event.respondWith(cacheFirst(event, STATIC));
});
