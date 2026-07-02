/**
 * PATCH /api/v1/users/:id/role  → change a user's role (ADMIN only).
 * Admins cannot demote themselves (enforced in userService).
 */
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { updateRoleSchema } from "@/lib/validation";
import { ok, handleError } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = updateRoleSchema.parse(body);
    const user = await userService.updateRole(id, input, actor);
    return ok({ user }, "Role updated");
  } catch (error) {
    return handleError(error);
  }
}
