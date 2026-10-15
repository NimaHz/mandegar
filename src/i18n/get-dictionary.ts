import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/fa";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fa: () => import("./dictionaries/fa").then((module) => module.fa),
  en: () => import("./dictionaries/en").then((module) => module.en),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
