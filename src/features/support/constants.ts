export const requestSteps = ["type", "product", "details", "contact", "review"] as const;

export type RequestStep = (typeof requestSteps)[number];
