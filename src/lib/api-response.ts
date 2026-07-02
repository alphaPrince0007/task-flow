/**
 * API response helpers.
 *
 * Every endpoint returns the same shape:
 *   success →  { success: true,  message, data }
 *   error   →  { success: false, message, errors? }
 *
 * `handleError` is the single place that turns a thrown value into a response.
 * It understands AppError (our typed errors) and ZodError (validation), and
 * falls back to a generic 500 that never leaks stack traces or internal
 * details in production.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { isProduction } from "@/config/env";
import type { ApiSuccess, ApiError } from "@/types";

/** Build a success response with an explicit HTTP status (default 200). */
export function ok<T>(
  data: T,
  message = "Success",
  status = 200,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

/** Convenience for 201 Created. */
export function created<T>(data: T, message = "Created"): NextResponse<ApiSuccess<T>> {
  return ok(data, message, 201);
}

/** Convert a Zod flatten() fieldErrors map into our errors shape. */
function zodToFieldErrors(err: ZodError): Record<string, string[]> {
  const flat = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(flat)) {
    if (val && val.length) out[key] = val;
  }
  return out;
}

/**
 * Central error handler. Wrap every route body in try/catch and call this in
 * the catch block. Returns a typed JSON error with the right status code.
 */
export function handleError(error: unknown): NextResponse<ApiError> {
  // Validation errors → 400 with field details.
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: zodToFieldErrors(error),
      },
      { status: 400 },
    );
  }

  // Our own typed errors → their declared status.
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: error.errors },
      { status: error.statusCode },
    );
  }

  // Anything else is unexpected: log it server-side, return a safe 500.
  logger.error("Unhandled error", error);
  return NextResponse.json(
    {
      success: false,
      message: isProduction ? "Internal server error" : String(error),
    },
    { status: 500 },
  );
}
