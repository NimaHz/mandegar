const print = (line) => process.stdout.write(`${line}\n`);
const base = (process.env.SITE_ORIGIN ?? "http://localhost:3000").replace(/\/+$/, "");
const explicitPaths = process.argv.slice(2);

const LANGUAGES = new Set(["fa-IR", "en"]);
const DATE_KEYS = new Set(["datePublished", "dateModified", "uploadDate"]);
const URL_KEYS = new Set([
  "url",
  "item",
  "contentUrl",
  "embedUrl",
  "thumbnailUrl",
  "image",
  "logo",
]);

const required = {
  Organization: ["name", "url", "logo"],
  WebSite: ["name", "url", "inLanguage"],
  WebPage: ["name", "url", "isPartOf", "inLanguage"],
  CollectionPage: ["name", "url", "isPartOf", "inLanguage"],
  ItemPage: ["name", "url", "isPartOf", "inLanguage", "mainEntity"],
  AboutPage: ["name", "url", "isPartOf"],
  ContactPage: ["name", "url", "isPartOf"],
  ProfilePage: ["name", "url", "isPartOf", "mainEntity"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  ItemList: ["itemListElement"],
  ListItem: ["position"],
  Product: ["name", "brand", "image", "description", "model"],
  Brand: ["name"],
  TechArticle: ["headline", "datePublished", "dateModified", "author", "publisher"],
  BlogPosting: ["headline", "datePublished", "dateModified", "author", "publisher", "image"],
  VideoObject: ["name", "description", "thumbnailUrl", "uploadDate"],
  Clip: ["name", "startOffset", "url"],
  HowTo: ["name", "step"],
  HowToStep: ["text"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  LocalBusiness: ["name", "address"],
  Store: ["name", "address"],
  Person: ["name"],
  Service: ["name", "provider"],
  DefinedTermSet: ["name", "hasDefinedTerm"],
  DefinedTerm: ["name", "description"],
  PropertyValue: ["name", "value"],
};

const stubRequired = {
  Product: ["name", "url"],
  Brand: ["name"],
  TechArticle: ["headline", "url"],
  BlogPosting: ["headline", "url"],
};

const decode = (text) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");

const normalize = (text) =>
  decode(text)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌‏‎]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const visibleText = (html) =>
  normalize(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );

const typesOf = (node) => (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]);

const walk = (value, visit, path = "$") => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    visit(value, path);
    for (const [key, item] of Object.entries(value)) walk(item, visit, `${path}.${key}`);
  }
};

const fetchText = async (url) => {
  const response = await fetch(url, { redirect: "follow" });
  return {
    status: response.status,
    type: response.headers.get("content-type") ?? "",
    body: await response.text(),
  };
};

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));

const discoverPaths = async () => {
  const pick = async (name, predicate) => {
    const { body } = await fetchText(`${base}/sitemaps/${name}.xml`);
    return locs(body)
      .map((loc) => new URL(loc).pathname)
      .filter(predicate);
  };
  const detail = (segment) => (path) => new RegExp(`^(/en)?/${segment}/[^/]+$`).test(path);
  const [products, categories, guides, posts] = await Promise.all([
    pick("products", detail("products")),
    pick("categories", detail("categories")),
    pick("guides", detail("guides")),
    pick("posts", detail("blog")),
  ]);
  const firstPair = (paths) => {
    const fa = paths.find((path) => !path.startsWith("/en/"));
    return fa ? [fa, `/en${fa}`] : [];
  };
  return [
    "/",
    "/en",
    ...firstPair(products),
    ...firstPair(categories),
    ...firstPair(guides),
    ...firstPair(posts),
    "/service-centers",
    "/en/service-centers",
  ];
};

const metaContent = (html, attr, name) => {
  const pattern = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*>`, "i");
  const tag = html.match(pattern)?.[0];
  return tag ? decode(tag.match(/content="([^"]*)"/i)?.[1] ?? "") : null;
};

const checkMetadata = async (html, report) => {
  const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");
  const description = metaContent(html, "name", "description");
  if (!title) report.error("metadata: missing <title>");
  else if ([...title].length > 60)
    report.warn(`metadata: title is ${[...title].length} chars (> 60)`);
  if (!description) report.error("metadata: missing meta description");
  else if ([...description].length > 155)
    report.warn(`metadata: description is ${[...description].length} chars (> 155)`);
  if (!/<link[^>]+rel="canonical"/i.test(html)) report.error("metadata: missing canonical");
  for (const hreflang of ["fa-IR", "en", "x-default"]) {
    if (!new RegExp(`<link[^>]+hreflang="${hreflang}"`, "i").test(html))
      report.error(`metadata: missing hreflang ${hreflang}`);
  }
  const ogImage = metaContent(html, "property", "og:image");
  if (!ogImage) {
    report.error("metadata: missing og:image");
    return;
  }
  if (!metaContent(html, "name", "twitter:card")) report.error("metadata: missing twitter:card");
  const image = await fetch(ogImage);
  const type = image.headers.get("content-type") ?? "";
  await image.arrayBuffer();
  if (image.status !== 200 || !type.startsWith("image/png"))
    report.error(`metadata: og:image ${ogImage} returned ${image.status} ${type}`);
};

const isExternalStub = (node, path, pagePath) => {
  if (path.split(".").length === 1 || typeof node["@id"] !== "string") return false;
  return new URL(node["@id"]).pathname.replace(/\/$/, "") !== pagePath.replace(/\/$/, "");
};

const checkGraph = (graph, text, report, pagePath) => {
  if (graph["@context"] !== "https://schema.org")
    report.error('json-ld: "@context" must be https://schema.org');
  if (!Array.isArray(graph["@graph"])) {
    report.error("json-ld: missing @graph array");
    return;
  }
  const defined = new Set();
  const references = [];
  let pages = 0;
  walk(graph["@graph"], (node, path) => {
    const keys = Object.keys(node);
    if (node["@id"] && keys.length === 1) references.push({ id: node["@id"], path });
    else if (node["@id"]) defined.add(node["@id"]);
  });
  for (const { id, path } of references) {
    if (!defined.has(id)) report.error(`json-ld: unresolved @id ${id} at ${path}`);
  }
  pages = graph["@graph"].filter(
    (node) => typeof node["@id"] === "string" && node["@id"].endsWith("#webpage"),
  ).length;
  walk(graph["@graph"], (node, path) => {
    if (!node["@type"]) return;
    const stub = isExternalStub(node, path, pagePath);
    for (const type of typesOf(node)) {
      for (const key of (stub ? stubRequired[type] : undefined) ?? required[type] ?? []) {
        const value = node[key];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          report.error(`json-ld: ${type} at ${path} is missing "${key}"`);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (
        DATE_KEYS.has(key) &&
        typeof value === "string" &&
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+03:30$/.test(value)
      )
        report.error(`json-ld: ${key} at ${path} is not an ISO date with +03:30 (${value})`);
      if (URL_KEYS.has(key) && typeof value === "string" && !/^https?:\/\//.test(value))
        report.error(`json-ld: ${key} at ${path} is not absolute (${value})`);
      if (key === "inLanguage" && !LANGUAGES.has(value))
        report.error(`json-ld: bad inLanguage ${value} at ${path}`);
    }
  });
  if (pages !== 1) report.error(`json-ld: expected exactly one #webpage node, found ${pages}`);
  if (/[۰-۹٠-٩]/.test(JSON.stringify(graph))) report.error("json-ld: contains non-ASCII digits");

  const visible = (value, label, strict) => {
    if (typeof value !== "string") return;
    if (!text.includes(normalize(value)))
      (strict ? report.error : report.warn)(`visible: ${label} "${value}" not found on the page`);
  };
  walk(graph["@graph"], (node, path) => {
    const types = typesOf(node);
    const topLevel = path.split(".").length === 1;
    if (types.includes("Product") && topLevel) visible(node.name, "Product.name", true);
    if (types.some((type) => type === "TechArticle" || type === "BlogPosting") && topLevel)
      visible(node.name ?? node.headline, `${types[0]}.headline`, true);
    if (types.includes("Question")) visible(node.name, "Question.name", true);
    if (types.includes("HowToStep")) visible(node.name, "HowToStep.name", true);
    if (types.includes("Clip")) visible(node.name, "Clip.name", false);
    if (types.includes("LocalBusiness") || types.includes("Store"))
      visible(node.name, `${types[0]}.name`, true);
    if (types.includes("ListItem") && node.name && !node.item?.["@type"])
      visible(node.name, "ListItem.name", true);
    if (types.includes("PropertyValue") && path.includes("additionalProperty"))
      visible(node.name, "PropertyValue.name", false);
  });
};

const validate = async (path) => {
  const errors = [];
  const warnings = [];
  const report = {
    error: (message) => errors.push(message),
    warn: (message) => warnings.push(message),
  };
  const { status, body } = await fetchText(`${base}${path}`);
  if (status !== 200) report.error(`http: status ${status}`);
  const blocks = [
    ...body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((match) => match[1]);
  if (blocks.length !== 1) report.error(`json-ld: expected 1 block, found ${blocks.length}`);
  const text = visibleText(body);
  let nodes = 0;
  for (const block of blocks) {
    try {
      const graph = JSON.parse(block);
      nodes += graph["@graph"]?.length ?? 0;
      checkGraph(graph, text, report, path);
    } catch (error) {
      report.error(`json-ld: parse failed (${error.message})`);
    }
  }
  await checkMetadata(body, report);
  return { path, nodes, errors, warnings };
};

const checkEndpoint = async (path, expectedType) => {
  const { status, type, body } = await fetchText(`${base}${path}`);
  const ok = status === 200 && type.includes(expectedType) && body.length > 0;
  return { path, ok, detail: `${status} ${type} ${body.length}B` };
};

const paths = explicitPaths.length > 0 ? explicitPaths : await discoverPaths();
const results = [];
for (const path of paths) results.push(await validate(path));

let failed = 0;
for (const result of results) {
  const status = result.errors.length === 0 ? "PASS" : "FAIL";
  if (result.errors.length > 0) failed += 1;
  print(
    `${status} ${result.path} (${result.nodes} nodes, ${result.errors.length} errors, ${result.warnings.length} warnings)`,
  );
  for (const message of result.errors) print(`  error   ${message}`);
  for (const message of result.warnings) print(`  warning ${message}`);
}

const endpoints = await Promise.all([
  checkEndpoint("/sitemap.xml", "xml"),
  checkEndpoint("/robots.txt", "text/plain"),
  checkEndpoint("/llms.txt", "text/plain"),
  checkEndpoint("/llms-full.txt", "text/plain"),
]);
for (const endpoint of endpoints) {
  if (!endpoint.ok) failed += 1;
  print(`${endpoint.ok ? "PASS" : "FAIL"} ${endpoint.path} (${endpoint.detail})`);
}

print(`\n${results.length} pages, ${failed} failures`);
process.exitCode = failed > 0 ? 1 : 0;
