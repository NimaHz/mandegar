import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "@/types/common";

export interface Province {
  code: string;
  name: LocalizedText;
}

export const provinces = [
  { code: "00", name: { fa: "مرکزی", en: "Markazi" } },
  { code: "01", name: { fa: "گیلان", en: "Gilan" } },
  { code: "02", name: { fa: "مازندران", en: "Mazandaran" } },
  { code: "03", name: { fa: "آذربایجان شرقی", en: "East Azerbaijan" } },
  { code: "04", name: { fa: "آذربایجان غربی", en: "West Azerbaijan" } },
  { code: "05", name: { fa: "کرمانشاه", en: "Kermanshah" } },
  { code: "06", name: { fa: "خوزستان", en: "Khuzestan" } },
  { code: "07", name: { fa: "فارس", en: "Fars" } },
  { code: "08", name: { fa: "کرمان", en: "Kerman" } },
  { code: "09", name: { fa: "خراسان رضوی", en: "Razavi Khorasan" } },
  { code: "10", name: { fa: "اصفهان", en: "Isfahan" } },
  { code: "11", name: { fa: "سیستان و بلوچستان", en: "Sistan and Baluchestan" } },
  { code: "12", name: { fa: "کردستان", en: "Kurdistan" } },
  { code: "13", name: { fa: "همدان", en: "Hamadan" } },
  { code: "14", name: { fa: "چهارمحال و بختیاری", en: "Chaharmahal and Bakhtiari" } },
  { code: "15", name: { fa: "لرستان", en: "Lorestan" } },
  { code: "16", name: { fa: "ایلام", en: "Ilam" } },
  { code: "17", name: { fa: "کهگیلویه و بویراحمد", en: "Kohgiluyeh and Boyer-Ahmad" } },
  { code: "18", name: { fa: "بوشهر", en: "Bushehr" } },
  { code: "19", name: { fa: "زنجان", en: "Zanjan" } },
  { code: "20", name: { fa: "سمنان", en: "Semnan" } },
  { code: "21", name: { fa: "یزد", en: "Yazd" } },
  { code: "22", name: { fa: "هرمزگان", en: "Hormozgan" } },
  { code: "23", name: { fa: "تهران", en: "Tehran" } },
  { code: "24", name: { fa: "اردبیل", en: "Ardabil" } },
  { code: "25", name: { fa: "قم", en: "Qom" } },
  { code: "26", name: { fa: "قزوین", en: "Qazvin" } },
  { code: "27", name: { fa: "گلستان", en: "Golestan" } },
  { code: "28", name: { fa: "خراسان شمالی", en: "North Khorasan" } },
  { code: "29", name: { fa: "خراسان جنوبی", en: "South Khorasan" } },
  { code: "30", name: { fa: "البرز", en: "Alborz" } },
] as const satisfies readonly Province[];

export type ProvinceCode = (typeof provinces)[number]["code"];

export const isProvinceCode = (value: string): value is ProvinceCode =>
  provinces.some((province) => province.code === value);

export const provinceName = (locale: Locale, code: string) =>
  provinces.find((province) => province.code === code)?.name[locale] ?? code;
