/**
 * POST /api/v1/auth/logout
 * Clear auth cookies. Idempotent — safe to call when already logged out.
 */
import { clearAuthCookies } from "@/lib/cookies";
import { ok, handleError } from "@/lib/api-response";

export async function POST() {
  try {
    await clearAuthCookies();
    return ok({}, "Logged out successfully");
  } catch (error) {
    return handleError(error);
  }
}
