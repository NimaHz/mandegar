import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  includesQuery,
  maskMobile,
  normalizeFa,
  normalizeMobile,
  toLatinDigits,
  toPersianDigits,
  toSearchKey,
} from "./persian";

describe("digits", () => {
  it("converts Persian and Arabic digits to Latin", () => {
    assert.equal(toLatinDigits("۰۱۲۳۴۵۶۷۸۹ ٠١٢٣٤٥٦٧٨٩"), "0123456789 0123456789");
  });

  it("converts Latin digits to Persian", () => {
    assert.equal(toPersianDigits("MC-4500"), "MC-۴۵۰۰");
  });
});

describe("normalizeFa", () => {
  it("unifies Arabic letters and strips tatweel and diacritics", () => {
    assert.equal(normalizeFa("كولر آبي"), "کولر ابی");
    assert.equal(normalizeFa("بـــخاری"), "بخاری");
    assert.equal(normalizeFa("مُحَمَّد"), "محمد");
    assert.equal(normalizeFa("مدل ۴۵۰۰"), "مدل 4500");
  });
});

describe("search keys", () => {
  it("collapses ZWNJ and spaces and lowercases", () => {
    assert.equal(toSearchKey("فن‌هیتر"), toSearchKey("فن هیتر"));
    assert.equal(toSearchKey("MC 4500"), "mc4500");
  });

  it("matches queries regardless of spelling variants", () => {
    assert.equal(includesQuery("كولر", "کولر آبی سلولزی"), true);
    assert.equal(includesQuery("آبگرمکن", "پنکه ایستاده"), false);
    assert.equal(includesQuery("", "anything"), true);
  });
});

describe("mobile numbers", () => {
  it("normalizes common formats", () => {
    for (const input of [
      "09121234567",
      "+989121234567",
      "00989121234567",
      "989121234567",
      "9121234567",
      "۰۹۱۲ ۱۲۳ ۴۵۶۷",
    ]) {
      assert.equal(normalizeMobile(input), "09121234567", input);
    }
  });

  it("rejects landlines and short numbers", () => {
    assert.equal(normalizeMobile("02188776655"), null);
    assert.equal(normalizeMobile("0912123"), null);
  });

  it("masks the middle digits", () => {
    assert.equal(maskMobile("09121234567"), "0912***4567");
  });
});
