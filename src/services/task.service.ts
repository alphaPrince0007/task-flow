/**
 * Task service — CRUD plus the ownership rules that make RBAC real.
 *
 * The key authorization principle lives in `assertCanAccess`: a regular user
 * may only touch their own tasks, while an admin may touch any. Every read,
 * update, and delete funnels through that check, so ownership can't be
 * bypassed by hitting the API directly. A missing task and a task owned by
 * someone else both return 404 to a normal user — we don't reveal that a task
 * exists but belongs to another account.
 */
import { taskRepository } from "@/repositories/task.repository";
import { NotFound } from "@/lib/errors";
import { ROLES } from "@/config/constants";
import type { CreateTaskInput, UpdateTaskInput, TaskQuery } from "@/lib/validation";
import type { AuthUser, PaginationMeta } from "@/types";

/** A task the caller is allowed to see; throws 404 otherwise. */
async function assertCanAccess(taskId: string, actor: AuthUser) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw NotFound("Task not found");

  const isOwner = task.userId === actor.id;
  const isAdmin = actor.role === ROLES.ADMIN;
  // Non-owners (who aren't admins) are told it simply doesn't exist.
  if (!isOwner && !isAdmin) throw NotFound("Task not found");

  return task;
}

export const taskService = {
  async create(input: CreateTaskInput, actor: AuthUser) {
    return taskRepository.create({
      title: input.title,
      description: input.description || null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      userId: actor.id, // ownership is always the authenticated user
    });
  },

  async getById(taskId: string, actor: AuthUser) {
    return assertCanAccess(taskId, actor);
  },

  async update(taskId: string, input: UpdateTaskInput, actor: AuthUser) {
    await assertCanAccess(taskId, actor);
    return taskRepository.update(taskId, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    });
  },

  async delete(taskId: string, actor: AuthUser) {
    await assertCanAccess(taskId, actor);
    await taskRepository.delete(taskId);
  },

  /**
   * List tasks the caller may see. Regular users are scoped to their own
   * tasks; admins see everything. Returns items + pagination metadata.
   */
  async list(query: TaskQuery, actor: AuthUser) {
    const ownerId = actor.role === ROLES.ADMIN ? undefined : actor.id;
    const { items, total } = await taskRepository.list({ ...query, ownerId });

    const meta: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
    return { items, meta };
  },

  /** Dashboard stats, scoped like `list`. */
  async stats(actor: AuthUser) {
    const ownerId = actor.role === ROLES.ADMIN ? undefined : actor.id;
    return taskRepository.stats(ownerId);
  },
};
