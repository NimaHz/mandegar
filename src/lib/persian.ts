const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const DIACRITICS = /[ً-ٰٟـ]/g;
const ZWNJ_AND_SPACES = /[‌‏‎\s]+/g;

export const toLatinDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persian = PERSIAN_DIGITS.indexOf(digit);
    return String(persian >= 0 ? persian : ARABIC_DIGITS.indexOf(digit));
  });

export const toPersianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);

export const normalizeFa = (value: string) =>
  toLatinDigits(value)
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[أإآ]/g, "ا")
    .replace(DIACRITICS, "");

export const toSearchKey = (value: string) =>
  normalizeFa(value).replace(ZWNJ_AND_SPACES, "").toLowerCase();

export const includesQuery = (query: string, ...fields: (string | null | undefined)[]) => {
  const needle = toSearchKey(query);
  if (!needle) return true;
  return fields.some((field) => field && toSearchKey(field).includes(needle));
};

export const normalizeMobile = (value: string) => {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  const local = digits.startsWith("0098")
    ? digits.slice(4)
    : digits.startsWith("98")
      ? digits.slice(2)
      : digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  return /^9\d{9}$/.test(local) ? `0${local}` : null;
};

export const maskMobile = (mobile: string) => `${mobile.slice(0, 4)}***${mobile.slice(-4)}`;
