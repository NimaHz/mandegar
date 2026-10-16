interface PartsTerms {
  months: number;
  partsMonths: number | null;
}

export const partsMonthsOf = ({ months, partsMonths }: PartsTerms) => partsMonths ?? months;
