const escapeCell = (value: string | number | null) => {
  const text = value === null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

export const toCsv = (rows: readonly (readonly (string | number | null)[])[]) =>
  `﻿${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}\r\n`;
