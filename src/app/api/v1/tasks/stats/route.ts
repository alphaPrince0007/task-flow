/**
 * GET /api/v1/tasks/stats  → aggregate task counts for the dashboard.
 * Scoped to the caller's own tasks; admins get global totals.
 *
 * NOTE: This lives under /tasks/stats. Because Next matches static segments
 * before dynamic ones, this does not collide with /tasks/[id].
 */
import { requireAuth } from "@/lib/auth";
import { taskService } from "@/services/task.service";
import { ok, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const actor = await requireAuth();
    const stats = await taskService.stats(actor);
    return ok({ stats }, "Stats fetched");
  } catch (error) {
    return handleError(error);
  }
}
