export const phoneHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;
