/**
 * User repository — the only place that talks to the DB for users.
 *
 * Repositories isolate persistence from business logic: services depend on
 * these methods, not on Prisma directly. That means the storage layer can
 * change (different ORM, add caching) without touching service code, and it
 * keeps queries in one testable, mockable place.
 *
 * `publicUserSelect` guarantees passwordHash is never selected into objects
 * that flow toward the API.
 */
import { prisma } from "@/lib/prisma";
import type { PublicUser, Role } from "@/types";

/** Field selection that deliberately excludes passwordHash. */
const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userRepository = {
  /** Full record including passwordHash — used only for auth (login). */
  findByEmailWithHash(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<PublicUser> {
    return prisma.user.create({ data, select: publicUserSelect });
  },

  update(
    id: string,
    data: Partial<{ name: string; email: string; role: Role }>,
  ): Promise<PublicUser> {
    return prisma.user.update({ where: { id }, data, select: publicUserSelect });
  },

  delete(id: string): Promise<PublicUser> {
    return prisma.user.delete({ where: { id }, select: publicUserSelect });
  },

  /** Admin: list all users with a task count, most recent first. */
  async listAll(): Promise<Array<PublicUser & { taskCount: number }>> {
    const users = await prisma.user.findMany({
      select: { ...publicUserSelect, _count: { select: { tasks: true } } },
      orderBy: { createdAt: "desc" },
    });
    type UserWithCount = PublicUser & { _count: { tasks: number } };
    return (users as UserWithCount[]).map((u) => {
      const { _count, ...rest } = u;
      return { ...rest, taskCount: _count.tasks };
    });
  },

  count() {
    return prisma.user.count();
  },
};
