/**
 * Shared domain types.
 *
 * Roles / statuses / priorities are derived from the runtime constants so a
 * value added in one place automatically flows into the type system. No
 * duplicated string unions to keep in sync.
 */
import type { ROLES, TASK_STATUS, TASK_PRIORITY } from "@/config/constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

/** The authenticated principal extracted from a verified JWT. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** JWT payload we sign and verify. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  type: "access" | "refresh";
}

/** A user object safe to send to clients (never includes passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/** Standard success envelope. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Standard error envelope. */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>; // field-level validation errors
}

/** Metadata returned alongside paginated lists. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
