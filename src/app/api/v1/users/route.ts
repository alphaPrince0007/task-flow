/**
 * GET /api/v1/users  → list all users (ADMIN only).
 * Protected by requireAdmin, which throws 403 for non-admins.
 */
import { requireAdmin } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { ok, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const users = await userService.listAllUsers();
    return ok({ users }, "Users fetched");
  } catch (error) {
    return handleError(error);
  }
}
