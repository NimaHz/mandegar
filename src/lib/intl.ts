const cached = <Options extends object, Formatter>(
  create: (locale: string, options?: Options) => Formatter,
) => {
  const formatters = new Map<string, Formatter>();
  return (locale: string, options?: Options) => {
    const key = options ? `${locale} ${JSON.stringify(options)}` : locale;
    let formatter = formatters.get(key);
    if (!formatter) {
      formatter = create(locale, options);
      formatters.set(key, formatter);
    }
    return formatter;
  };
};

export const numberFormat = cached(
  (locale, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options),
);

export const listFormat = cached(
  (locale, options?: Intl.ListFormatOptions) => new Intl.ListFormat(locale, options),
);

export const pluralRules = cached(
  (locale, options?: Intl.PluralRulesOptions) => new Intl.PluralRules(locale, options),
);

export const dateTimeFormat = cached(
  (locale, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options),
);
