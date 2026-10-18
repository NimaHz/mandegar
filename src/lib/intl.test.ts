import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatNumber } from "./format";
import { dateTimeFormat, numberFormat, pluralRules } from "./intl";

describe("cached Intl formatters", () => {
  it("reuses one formatter per locale and options", () => {
    assert.equal(numberFormat("fa-IR"), numberFormat("fa-IR"));
    assert.equal(
      numberFormat("en", { minimumIntegerDigits: 2 }),
      numberFormat("en", { minimumIntegerDigits: 2 }),
    );
    assert.equal(pluralRules("en"), pluralRules("en"));
  });

  it("keeps locales and options apart", () => {
    assert.notEqual(numberFormat("fa-IR"), numberFormat("en"));
    assert.notEqual(numberFormat("en"), numberFormat("en", { useGrouping: false }));
    assert.equal(numberFormat("en", { useGrouping: false }).format(1405), "1405");
    assert.equal(numberFormat("en").format(1405), "1,405");
  });

  it("formats exactly like a fresh formatter", () => {
    const options = { timeZone: "Asia/Tehran", year: "numeric", month: "long" } as const;
    const date = new Date("2026-10-18T12:00:00Z");
    assert.equal(
      dateTimeFormat("fa-IR-u-ca-persian", options).format(date),
      new Intl.DateTimeFormat("fa-IR-u-ca-persian", options).format(date),
    );
    assert.equal(formatNumber("fa", 7, { minimumIntegerDigits: 2 }), "۰۷");
  });
});
