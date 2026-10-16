import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ProductDetail } from "@/types/catalog";

import { productMarkdown } from "./markdown";
import { absoluteUrl } from "./urls";

const product: ProductDetail = {
  slug: "mc-4500",
  modelCode: "MC-4500",
  name: "Cellulose Cooler",
  tagline: "Best-seller for mid-sized homes",
  image: null,
  category: { slug: "coolers", name: "Coolers" },
  brand: { slug: "mandegar", name: "Mandegar", isOwn: true },
  energyClass: "A",
  isNew: false,
  featured: true,
  warrantyMonths: 18,
  summary: "A quiet cooler.",
  description: "A quiet cooler.\n\n# Highlights\n\nSee the [manual](/uploads/manual.pdf).",
  gallery: [],
  keyFacts: [{ label: "Airflow", value: "4,500 m³/h" }],
  specs: [
    {
      title: "Performance",
      items: [
        {
          key: "airflow",
          label: "Airflow | nominal",
          value: "4,500",
          numeric: 4500,
          unit: "m³/h",
          unitCode: null,
        },
      ],
    },
  ],
  features: [],
  downloads: [],
  faqs: [{ question: "Is it quiet?", answer: "Yes\\." }],
  guideSlug: null,
  releaseYear: 2025,
  seo: { title: null, description: null },
  publishedAt: null,
  updatedAt: "2026-10-15T14:07:31.000Z",
};

describe("productMarkdown", () => {
  const markdown = productMarkdown("en", { product, guide: null, policy: null, related: [] });

  it("starts with front matter naming the page and both Markdown copies", () => {
    assert.ok(markdown.startsWith('---\ntitle: "Cellulose Cooler (MC-4500)"\n'));
    assert.ok(markdown.includes(`url: "${absoluteUrl("/en/products/mc-4500")}"`));
    assert.ok(markdown.includes(`fa-IR: "${absoluteUrl("/products/mc-4500.md")}"`));
    assert.ok(markdown.includes('updated: "2026-10-15T17:37:31+03:30"'));
    assert.ok(markdown.includes("\n# Cellulose Cooler (MC-4500)\n"));
  });

  it("nests editor headings under the page sections and absolutizes links", () => {
    assert.ok(markdown.includes("\n### Highlights\n"));
    assert.ok(markdown.includes(`[manual](${absoluteUrl("/uploads/manual.pdf")})`));
    assert.equal(markdown.split("A quiet cooler.").length - 1, 1);
  });

  it("escapes table pipes and keeps units", () => {
    assert.ok(markdown.includes("| Airflow \\| nominal | 4,500 m³/h |"));
  });

  it("drops escapes in front of plain punctuation in answers", () => {
    assert.ok(markdown.includes("### Is it quiet?\n\nYes."));
  });
});
