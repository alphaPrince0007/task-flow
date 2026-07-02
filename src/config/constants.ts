/**
 * Application-wide constants.
 *
 * Centralizing these as `as const` objects gives us a single source of truth
 * plus literal-union types derived from the values (see src/types), so the
 * database strings and the TypeScript types can never drift apart.
 */

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const TASK_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

/** Names of the auth cookies (HTTP-only). */
export const COOKIE = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/** Default pagination settings for list endpoints. */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
