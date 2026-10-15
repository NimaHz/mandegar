import { toLatinDigits } from "./persian";

export const phoneHref = (value: string) => `tel:${toLatinDigits(value).replace(/[^\d+]/g, "")}`;
