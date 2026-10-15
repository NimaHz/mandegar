const DAY_MS = 86_400_000;

const formatter = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

const partsOf = (time: number): JalaliDate => {
  const parts = formatter.formatToParts(new Date(time));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN);
  return { year: value("year"), month: value("month"), day: value("day") };
};

const dayOfYear = (month: number, day: number) =>
  (month <= 6 ? (month - 1) * 31 : 186 + (month - 7) * 30) + day;

const compare = (left: JalaliDate, right: JalaliDate) =>
  left.year - right.year || left.month - right.month || left.day - right.day;

export const jalaliToIso = ({ year, month, day }: JalaliDate) => {
  const target = { year, month, day };
  let time = Date.UTC(year + 621, 2, 20) + (dayOfYear(month, day) - 1) * DAY_MS;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const current = partsOf(time);
    const order = compare(target, current);
    if (order === 0) break;
    const delta =
      (year - current.year) * 365 + dayOfYear(month, day) - dayOfYear(current.month, current.day);
    time += (delta === 0 ? Math.sign(order) : delta) * DAY_MS;
  }
  const result = partsOf(time);
  return result.year === year && result.month === month && result.day === day
    ? new Date(time).toISOString().slice(0, 10)
    : null;
};

export const isoToJalali = (iso: string): JalaliDate | null => {
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(time) ? null : partsOf(time);
};

export const jalaliMonthLength = (year: number, month: number) => {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return jalaliToIso({ year, month: 12, day: 30 }) ? 30 : 29;
};
