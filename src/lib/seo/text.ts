const TEHRAN_OFFSET_MINUTES = 210;

export const tehranIso = (value: string | Date) => {
  const shifted = new Date(new Date(value).getTime() + TEHRAN_OFFSET_MINUTES * 60_000);
  return `${shifted.toISOString().slice(0, 19)}+03:30`;
};

export const isoDuration = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const parts = [hours && `${hours}H`, minutes && `${minutes}M`, rest && `${rest}S`].filter(
    Boolean,
  );
  return `PT${parts.join("") || "0S"}`;
};

export const plainText = (markdown: string) =>
  markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const truncate = (text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > max * 0.6 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
};
