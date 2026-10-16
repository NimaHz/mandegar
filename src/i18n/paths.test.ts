import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { localizePath, stripLocalePrefix } from "./paths";

describe("localizePath", () => {
  it("prefixes English paths and leaves Persian paths bare", () => {
    assert.equal(localizePath("en", "/products"), "/en/products");
    assert.equal(localizePath("en", "/"), "/en");
    assert.equal(localizePath("fa", "/products"), "/products");
    assert.equal(localizePath("fa", "/"), "/");
  });

  it("does not prefix a path that already carries a locale", () => {
    assert.equal(localizePath("en", "/en/products/mc-4500"), "/en/products/mc-4500");
    assert.equal(localizePath("fa", "/en/products/mc-4500"), "/products/mc-4500");
    assert.equal(localizePath("en", "/fa/warranty"), "/en/warranty");
    assert.equal(localizePath("en", "/en"), "/en");
  });

  it("keeps the query and hash on the home path without a trailing slash", () => {
    assert.equal(localizePath("en", "/?q=1"), "/en?q=1");
    assert.equal(localizePath("en", "/#top"), "/en#top");
    assert.equal(localizePath("en", "/products?page=2"), "/en/products?page=2");
  });
});

describe("stripLocalePrefix", () => {
  it("removes a leading locale segment only", () => {
    assert.equal(stripLocalePrefix("/en/products"), "/products");
    assert.equal(stripLocalePrefix("/en"), "/");
    assert.equal(stripLocalePrefix("/en?q=1"), "/?q=1");
    assert.equal(stripLocalePrefix("/english"), "/english");
    assert.equal(stripLocalePrefix("/products/en"), "/products/en");
    assert.equal(stripLocalePrefix(""), "/");
  });
});
