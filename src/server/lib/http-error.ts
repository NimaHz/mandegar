export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "INVALID_CREDENTIALS"
  | "PASSWORD_CHANGE_REQUIRED"
  | "FORBIDDEN"
  | "ORIGIN_REJECTED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE"
  | "IN_USE"
  | "HAS_WARRANTY_CODES"
  | "LENGTH_REQUIRED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA"
  | "SPAM_REJECTED"
  | "CHALLENGE_FAILED"
  | "LIMIT_REACHED"
  | "RATE_LIMITED"
  | "INTERNAL";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly retryAfterSec: number | null = null,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class ValidationFailure extends HttpError {
  constructor(readonly fields: Record<string, string>) {
    super(422, "VALIDATION", "Invalid request");
  }
}

export const isHttpError = (error: unknown): error is HttpError =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  "code" in error &&
  typeof error.status === "number" &&
  typeof error.code === "string" &&
  error instanceof Error &&
  error.name === "HttpError";

export const isValidationFailure = (error: unknown): error is ValidationFailure =>
  isHttpError(error) && "fields" in error && typeof error.fields === "object";

export const unauthorized = (
  message = "Authentication required",
  code: ErrorCode = "UNAUTHORIZED",
) => new HttpError(401, code, message);

export const forbidden = (message = "Not allowed", code: ErrorCode = "FORBIDDEN") =>
  new HttpError(403, code, message);

export const notFound = (message = "Not found") => new HttpError(404, "NOT_FOUND", message);

export const conflict = (message: string, code: ErrorCode = "CONFLICT") =>
  new HttpError(409, code, message);

export const stale = () => conflict("Changed by someone else since it was loaded", "STALE");

export const payloadTooLarge = (message = "Payload too large") =>
  new HttpError(413, "PAYLOAD_TOO_LARGE", message);

export const unsupportedMedia = (message: string) =>
  new HttpError(415, "UNSUPPORTED_MEDIA", message);

export const tooManyRequests = (retryAfterSec: number) =>
  new HttpError(429, "RATE_LIMITED", "Too many requests", retryAfterSec);

export const orNotFound = <TValue>(value: TValue | null | undefined, message?: string): TValue => {
  if (value === null || value === undefined) throw notFound(message);
  return value;
};
