/**
 * Zod validation schemas.
 *
 * Every request body/query is parsed against one of these before any business
 * logic runs. Parsing does three jobs at once: it rejects malformed input
 * (returning 400 with field errors), it strips unknown keys (mitigating
 * mass-assignment / over-posting), and it narrows types so the rest of the
 * code works with validated, correctly-typed data.
 */
import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY, ROLES, PAGINATION } from "@/config/constants";

// ── Auth ────────────────────────────────────────────────────────────────────

/** Password policy: length + at least one letter and one number. */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters") // bcrypt's byte limit
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

// ── Tasks ───────────────────────────────────────────────────────────────────

const statusEnum = z.enum([
  TASK_STATUS.PENDING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
]);

const priorityEnum = z.enum([
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: statusEnum.default(TASK_STATUS.PENDING),
  priority: priorityEnum.default(TASK_PRIORITY.MEDIUM),
  // Accept an ISO date string or null; coerce to Date.
  dueDate: z.coerce.date().optional().nullable(),
});

/** All fields optional on update; at least one must be present. */
export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    dueDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

/** Query params for the task list: pagination, search, filter, sort. */
export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().max(120).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  sortBy: z.enum(["createdAt", "dueDate", "priority", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const updateRoleSchema = z.object({
  role: z.enum([ROLES.USER, ROLES.ADMIN]),
});

// Inferred types for use across services/repositories.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
