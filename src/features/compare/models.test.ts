import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { COMPARE_LIMIT } from "@/types/catalog";

import { parseModels } from "./models";

describe("compare models", () => {
  it("accepts every slug the slug schema allows", () => {
    const longest = `${"a".repeat(60)}-${"b".repeat(59)}`;
    assert.deepEqual(parseModels(longest), [longest]);
    assert.deepEqual(parseModels(`mc-4500,${longest}`), ["mc-4500", longest]);
    assert.deepEqual(parseModels(`${longest}b`), []);
  });

  it("normalises, dedupes and caps the requested models", () => {
    assert.deepEqual(parseModels([" MC-4500 ", "mc-4500,bad slug,,mc-۳۵۰۰"]), [
      "mc-4500",
      "mc-3500",
    ]);
    assert.equal(parseModels("a,b,c,d,e").length, COMPARE_LIMIT);
    assert.deepEqual(parseModels(undefined), []);
  });
});
