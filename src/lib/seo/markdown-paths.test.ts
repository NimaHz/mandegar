import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { markdownPage, markdownPath, markdownRoute } from "./markdown-paths";

describe("markdownPage", () => {
  it("recognises detail pages and the FAQ", () => {
    assert.deepEqual(markdownPage("/products/mc-4500"), { kind: "product", slug: "mc-4500" });
    assert.deepEqual(markdownPage("/categories/gas-heaters"), {
      kind: "category",
      slug: "gas-heaters",
    });
    assert.deepEqual(markdownPage("/guides/cooler"), { kind: "guide", slug: "cooler" });
    assert.deepEqual(markdownPage("/blog/news"), { kind: "post", slug: "news" });
    assert.deepEqual(markdownPage("/faq"), { kind: "faq" });
  });

  it("rejects listings, queries, nested paths and private sections", () => {
    for (const path of [
      "/",
      "/products",
      "/products/mc-4500/extra",
      "/products/mc-4500?tab=specs",
      "/products/mc-4500.md",
      "/brands/aras-home",
      "/admin/products/1",
      "/api/products/x",
      "/w/ABC",
    ]) {
      assert.equal(markdownPage(path), null, path);
    }
  });
});

describe("markdownPath", () => {
  it("adds the extension to the localized path", () => {
    assert.equal(markdownPath("fa", "/products/mc-4500"), "/products/mc-4500.md");
    assert.equal(markdownPath("en", "/faq"), "/en/faq.md");
    assert.equal(markdownPath("en", "/about"), null);
  });

  it("builds the internal route", () => {
    assert.equal(markdownRoute("en", "/blog/news"), "/md/en/blog/news");
  });
});
