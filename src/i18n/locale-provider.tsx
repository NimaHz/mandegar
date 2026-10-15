"use client";

import { createContext, type ReactNode, use } from "react";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/fa";

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps extends LocaleContextValue {
  children: ReactNode;
}

export function LocaleProvider({ locale, dictionary, children }: LocaleProviderProps) {
  return <LocaleContext value={{ locale, dictionary }}>{children}</LocaleContext>;
}

const useLocaleContext = () => {
  const context = use(LocaleContext);
  if (!context) throw new Error("LocaleProvider is missing");
  return context;
};

export const useLocale = () => useLocaleContext().locale;

export const useDictionary = () => useLocaleContext().dictionary;
