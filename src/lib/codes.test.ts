import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CODE_ALPHABET, hasValidCheck, normalizeCode } from "./codes";
import { createTrackingCode, formatTrackingCode, parseTrackingCode } from "./tracking-code";
import { createWarrantyCode, formatWarrantyCode, parseWarrantyCode } from "./warranty-code";

const PERSIAN_KEYS: Record<string, string> = {
  Q: "ض",
  W: "ص",
  E: "ث",
  R: "ق",
  T: "ف",
  Y: "غ",
  U: "ع",
  P: "ح",
  A: "ش",
  S: "س",
  D: "ی",
  F: "ب",
  G: "ل",
  H: "ا",
  J: "ت",
  K: "ن",
  M: "پ",
  Z: "ظ",
  X: "ط",
  C: "ز",
  V: "ر",
  B: "ذ",
  N: "د",
};

const reasonOf = (input: string) => {
  const parsed = parseWarrantyCode(input);
  return parsed.valid ? null : parsed.reason;
};

const toPersianKeyboard = (code: string) =>
  [...code]
    .map((symbol) => PERSIAN_KEYS[symbol] ?? "۰۱۲۳۴۵۶۷۸۹"[Number(symbol)] ?? symbol)
    .join("");

describe("warranty codes", () => {
  it("round-trips generated batch codes for every supported year", () => {
    for (const year of [1400, 1404, 1405, 1420]) {
      const code = createWarrantyCode(year);
      const parsed = parseWarrantyCode(formatWarrantyCode(code));
      assert.deepEqual(parsed, { valid: true, code, kind: "batch", productionYear: year });
    }
  });

  it("round-trips unit serials", () => {
    const code = createWarrantyCode(1405, "unit");
    assert.equal(code.length, 12);
    assert.deepEqual(parseWarrantyCode(code), {
      valid: true,
      code,
      kind: "unit",
      productionYear: 1405,
    });
  });

  it("detects every single-symbol typo", () => {
    const code = createWarrantyCode(1405);
    for (let index = 0; index < code.length; index += 1) {
      for (const symbol of CODE_ALPHABET) {
        if (symbol === code[index]) continue;
        const typo = `${code.slice(0, index)}${symbol}${code.slice(index + 1)}`;
        assert.equal(hasValidCheck(typo), false, typo);
      }
    }
  });

  it("detects adjacent swaps", () => {
    for (let round = 0; round < 50; round += 1) {
      const code = createWarrantyCode(1404);
      for (let index = 0; index < code.length - 1; index += 1) {
        if (code[index] === code[index + 1]) continue;
        const swapped = `${code.slice(0, index)}${code[index + 1]}${code[index]}${code.slice(index + 2)}`;
        assert.equal(hasValidCheck(swapped), false, swapped);
      }
    }
  });

  it("accepts Persian digits and Persian keyboard input", () => {
    const code = createWarrantyCode(1405);
    const parsed = parseWarrantyCode(toPersianKeyboard(formatWarrantyCode(code)));
    assert.equal(parsed.valid, true);
    assert.equal(parsed.code, code);
  });

  it("folds case, spacing and ambiguous letters", () => {
    const code = createWarrantyCode(1401);
    const messy = ` ${formatWarrantyCode(code).toLowerCase().replaceAll("0", "o").replaceAll("1", "l")} `;
    assert.equal(normalizeCode(messy), code);
    assert.equal(parseWarrantyCode(messy).valid, true);
  });

  it("reports why a code is invalid", () => {
    const code = createWarrantyCode(1405);
    assert.equal(reasonOf("  "), "empty");
    assert.equal(reasonOf(`X${code.slice(1)}`), "prefix");
    assert.equal(reasonOf(code.slice(0, 8)), "length");
    assert.equal(reasonOf(`${code.slice(0, 8)}${code[8] === "0" ? "1" : "0"}`), "check");
    assert.equal(reasonOf(code), null);
  });
});

describe("tracking codes", () => {
  it("round-trips and rejects tampering", () => {
    const code = createTrackingCode();
    assert.equal(parseTrackingCode(formatTrackingCode(code).toLowerCase()), code);
    assert.equal(
      parseTrackingCode(`${code.slice(0, 4)}${code[4] === "A" ? "B" : "A"}${code.slice(5)}`),
      null,
    );
    assert.equal(parseTrackingCode(createWarrantyCode(1405)), null);
  });
});
