/**
 * Centralized error handling.
 *
 * A single `AppError` type carries an HTTP status code plus an optional map of
 * field-level validation errors. Route handlers throw these; a shared handler
 * (see `handleError` in api-response.ts) converts any thrown value into a
 * consistent JSON error envelope. This keeps error logic out of the happy path
 * and guarantees uniform responses.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    // Restore prototype chain (required when extending built-ins in TS).
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** 400 — malformed request or failed validation. */
export const BadRequest = (msg = "Bad request", errors?: Record<string, string[]>) =>
  new AppError(400, msg, errors);

/** 401 — missing or invalid authentication. */
export const Unauthorized = (msg = "Unauthorized") => new AppError(401, msg);

/** 403 — authenticated but not allowed. */
export const Forbidden = (msg = "Forbidden") => new AppError(403, msg);

/** 404 — resource does not exist (or is not visible to this user). */
export const NotFound = (msg = "Not found") => new AppError(404, msg);

/** 409 — conflict, e.g. duplicate email on registration. */
export const Conflict = (msg = "Conflict") => new AppError(409, msg);
