/**
 * GET    /api/v1/tasks/:id  → fetch one task (owner or admin only)
 * PATCH  /api/v1/tasks/:id  → update one task (owner or admin only)
 * DELETE /api/v1/tasks/:id  → delete one task (owner or admin only)
 *
 * Ownership/RBAC is enforced in taskService (see assertCanAccess). Non-owners
 * receive 404, not 403, so task existence isn't leaked.
 */
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { taskService } from "@/services/task.service";
import { updateTaskSchema } from "@/lib/validation";
import { ok, handleError } from "@/lib/api-response";

// In Next.js 15, dynamic route params are async.
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAuth();
    const { id } = await params;
    const task = await taskService.getById(id, actor);
    return ok({ task }, "Task fetched");
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = updateTaskSchema.parse(body);
    const task = await taskService.update(id, input, actor);
    return ok({ task }, "Task updated");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAuth();
    const { id } = await params;
    await taskService.delete(id, actor);
    return ok({}, "Task deleted");
  } catch (error) {
    return handleError(error);
  }
}
