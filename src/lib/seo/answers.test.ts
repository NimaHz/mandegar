import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderMarkdown } from "@/components/shared/markdown";
import type { ProductInsight } from "@/types/catalog";

import { categoryChoiceFaqs } from "./answers";
import { plainText } from "./text";

const product = (modelCode: string, name: string, value: string): ProductInsight => ({
  slug: modelCode.toLowerCase(),
  name,
  modelCode,
  warrantyMonths: 18,
  keyFacts: [{ label: "- توان", value }],
  faqs: [],
});

const products = [
  product("MGH-9000", "بخاری *ویژه* MGH-9000", "2_000 وات & [بیشتر](https://example.com)"),
  product("MC-4500", "Heater `Pro` &amp; <b>", "1. ~3.5~ kW"),
];

describe("categoryChoiceFaqs", () => {
  it("renders admin values as literal text", () => {
    const [choose, range] = categoryChoiceFaqs("fa", "بخاری", products);
    assert.equal(
      renderMarkdown(choose?.answer ?? ""),
      '<p>- توان مدل‌ها را با نیاز خود مقایسه کنید: <bdi dir="ltr" class="whitespace-nowrap">MGH-9000</bdi> با 2_000 وات &amp; [بیشتر](https://example.com) و <bdi dir="ltr" class="whitespace-nowrap">MC-4500</bdi> با 1. ~3.5~ kW.</p>\n',
    );
    assert.equal(
      renderMarkdown(range?.answer ?? ""),
      '<p>۲ مدل: بخاری *ویژه* <bdi dir="ltr" class="whitespace-nowrap">MGH-9000</bdi> و Heater `Pro` &amp;amp; &lt;b&gt;. همه این مدل‌ها ۱۸ ماه گارانتی رسمی دارند.</p>\n',
    );
  });

  it("keeps values that span lines inside one paragraph", () => {
    const [choose, range] = categoryChoiceFaqs("en", "Heaters", [
      product("MGH-9000", "Heater\n  - listed", "2 kW\n\n    code"),
      product("MC-4500", "Other\n   ---", "3 kW"),
    ]);
    assert.equal(
      renderMarkdown(choose?.answer ?? ""),
      '<p>Compare the - توان of each model with your needs: <bdi dir="ltr" class="whitespace-nowrap">MGH-9000</bdi>: 2 kW code and <bdi dir="ltr" class="whitespace-nowrap">MC-4500</bdi>: 3 kW.</p>\n',
    );
    assert.equal(
      renderMarkdown(range?.answer ?? ""),
      "<p>2 models: Heater - listed and Other ---. All of them carry an official 18-month warranty.</p>\n",
    );
  });

  it("keeps the plain text for structured data", () => {
    const [choose] = categoryChoiceFaqs("en", "Heaters", products);
    assert.equal(
      plainText(choose?.answer ?? ""),
      "Compare the - توان of each model with your needs: MGH-9000: 2000 وات & بیشتر and MC-4500: 1. 3.5 kW.",
    );
  });
});
