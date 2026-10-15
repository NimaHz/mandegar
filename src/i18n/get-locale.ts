import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";

import { isLocale, type Locale } from "./config";

export const getLocale = async (): Promise<Locale> => {
  const locale = await localeParam();
  if (!isLocale(locale)) notFound();
  return locale;
};
