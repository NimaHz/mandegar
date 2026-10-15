export const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const PERSIAN_KEYBOARD: Record<string, string> = {
  ض: "Q",
  ص: "W",
  ث: "E",
  ق: "R",
  ف: "T",
  غ: "Y",
  ع: "U",
  ه: "I",
  خ: "O",
  ح: "P",
  ش: "A",
  س: "S",
  ی: "D",
  ي: "D",
  ب: "F",
  ل: "G",
  ا: "H",
  ت: "J",
  ن: "K",
  م: "L",
  ظ: "Z",
  ط: "X",
  ز: "C",
  ر: "V",
  ذ: "B",
  د: "N",
  پ: "M",
};

const AMBIGUOUS: Record<string, string> = { O: "0", I: "1", L: "1" };

const double = (value: number) => {
  const shifted = value << 1;
  return shifted & 32 ? shifted ^ 0b100101 : shifted;
};

const accumulate = (symbols: string) =>
  [...symbols].reduce((sum, symbol) => double(sum) ^ CODE_ALPHABET.indexOf(symbol), 0);

export const checkSymbol = (data: string) => CODE_ALPHABET[double(accumulate(data))] ?? "0";

export const isAlphabetic = (value: string) =>
  [...value].every((symbol) => CODE_ALPHABET.includes(symbol));

export const hasValidCheck = (code: string) =>
  code.length > 1 && isAlphabetic(code) && accumulate(code) === 0;

export const normalizeCode = (input: string) =>
  [...input]
    .map((symbol) => {
      const persianDigit = "۰۱۲۳۴۵۶۷۸۹".indexOf(symbol);
      if (persianDigit >= 0) return String(persianDigit);
      const arabicDigit = "٠١٢٣٤٥٦٧٨٩".indexOf(symbol);
      if (arabicDigit >= 0) return String(arabicDigit);
      return PERSIAN_KEYBOARD[symbol] ?? symbol;
    })
    .join("")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/[OIL]/g, (symbol) => AMBIGUOUS[symbol] ?? symbol);

export const randomSymbols = (length: number) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((byte) => CODE_ALPHABET[byte & 31]).join("");
};

export const groupCode = (code: string, size = 3) =>
  code.match(new RegExp(`.{1,${size}}`, "g"))?.join("-") ?? code;
