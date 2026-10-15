export const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";
