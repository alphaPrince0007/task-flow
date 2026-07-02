/**
 * Task repository — all task persistence lives here.
 *
 * The `list` method builds a Prisma query from validated filters (owner scope,
 * search, status, priority) and returns both the page of rows and the total
 * count in a single transaction, so pagination metadata is always consistent.
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { TaskQuery } from "@/lib/validation";

interface ListParams extends TaskQuery {
  /** When set, restrict to this owner (regular users). Omit for admin/global. */
  ownerId?: string;
}

export const taskRepository = {
  findById(id: string) {
    return prisma.task.findUnique({ where: { id } });
  },

  create(data: {
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | null;
    userId: string;
  }) {
    return prisma.task.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      status: string;
      priority: string;
      dueDate: Date | null;
    }>,
  ) {
    return prisma.task.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  /**
   * Paginated, filterable, sortable list. Returns the rows plus the total
   * matching count (for pagination math). Runs both in one transaction.
   */
  async list(params: ListParams) {
    const { page, limit, search, status, priority, sortBy, sortOrder, ownerId } = params;

    const where: Prisma.TaskWhereInput = {
      ...(ownerId ? { userId: ownerId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(search
        ? {
            // SQLite is case-insensitive for ASCII by default; no `mode` needed.
            OR: [{ title: { contains: search } }, { description: { contains: search } }],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        // Admin views benefit from knowing the owner.
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total };
  },

  /** Aggregate counts for dashboard stats, optionally scoped to one owner. */
  async stats(ownerId?: string) {
    const where = ownerId ? { userId: ownerId } : {};
    const [total, pending, inProgress, completed] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: "PENDING" } }),
      prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
    ]);
    return { total, pending, inProgress, completed };
  },
};
