/**
 * GET  /api/v1/tasks   → list the caller's tasks (admins: all), with
 *                         pagination, search, filter, and sort via query params.
 * POST /api/v1/tasks   → create a task owned by the caller.
 */
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { taskService } from "@/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/lib/validation";
import { ok, created, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireAuth();

    // Parse & validate query string into a typed object.
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = taskQuerySchema.parse(params);

    const { items, meta } = await taskService.list(query, actor);
    return ok({ tasks: items, pagination: meta }, "Tasks fetched");
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const input = createTaskSchema.parse(body);

    const task = await taskService.create(input, actor);
    return created({ task }, "Task created");
  } catch (error) {
    return handleError(error);
  }
}
