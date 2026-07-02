/**
 * DELETE /api/v1/users/:id  → delete a user and their tasks (ADMIN only).
 * Admins cannot delete their own account (enforced in userService).
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { ok, handleError } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;
    await userService.deleteUser(id, actor);
    return ok({}, "User deleted");
  } catch (error) {
    return handleError(error);
  }
}
