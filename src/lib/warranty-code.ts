import {
  checkSymbol,
  CODE_ALPHABET,
  groupCode,
  hasValidCheck,
  normalizeCode,
  randomSymbols,
} from "./codes";

export const WARRANTY_CODE_LENGTH = 9;
export const SERIAL_CODE_LENGTH = 12;
export const JALALI_YEAR_BASE = 1400;

export type WarrantyCodeKind = "batch" | "unit";

export type ParsedWarrantyCode =
  | { valid: true; code: string; kind: WarrantyCodeKind; productionYear: number }
  | { valid: false; code: string; reason: "empty" | "length" | "prefix" | "check" };

export const yearSymbol = (jalaliYear: number) => {
  const symbol = CODE_ALPHABET[jalaliYear - JALALI_YEAR_BASE];
  if (!symbol) throw new RangeError(`Unsupported production year ${jalaliYear}`);
  return symbol;
};

export const createWarrantyCode = (jalaliYear: number, kind: WarrantyCodeKind = "batch") => {
  const body = `${kind === "batch" ? "W" : "S"}${yearSymbol(jalaliYear)}${randomSymbols(
    (kind === "batch" ? WARRANTY_CODE_LENGTH : SERIAL_CODE_LENGTH) - 3,
  )}`;
  return `${body}${checkSymbol(body)}`;
};

export const parseWarrantyCode = (input: string): ParsedWarrantyCode => {
  const code = normalizeCode(input);
  if (!code) return { valid: false, code, reason: "empty" };
  const kind: WarrantyCodeKind | null = code.startsWith("W")
    ? "batch"
    : code.startsWith("S")
      ? "unit"
      : null;
  if (!kind) return { valid: false, code, reason: "prefix" };
  const expected = kind === "batch" ? WARRANTY_CODE_LENGTH : SERIAL_CODE_LENGTH;
  if (code.length !== expected) return { valid: false, code, reason: "length" };
  if (!hasValidCheck(code)) return { valid: false, code, reason: "check" };
  return {
    valid: true,
    code,
    kind,
    productionYear: JALALI_YEAR_BASE + CODE_ALPHABET.indexOf(code[1] ?? "0"),
  };
};

export const formatWarrantyCode = (code: string) =>
  groupCode(code, code.length === SERIAL_CODE_LENGTH ? 4 : 3);
