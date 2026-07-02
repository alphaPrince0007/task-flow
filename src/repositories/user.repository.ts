/**
 * User repository — the only place that talks to the DB for users.
 *
 * `role` is stored as a plain string in the schema (for SQLite/Postgres
 * portability), so Prisma types it as `string`. The domain type `PublicUser`
 * narrows it to `Role` ("USER" | "ADMIN"). This repository is the boundary that
 * maps the raw row to the domain type via `toPublicUser`.
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

/** Raw shape returned by Prisma for the selected fields (role is a string). */
type RawUser = Omit<PublicUser, "role"> & { role: string };

/** Map a raw DB row to the domain type, narrowing `role` to `Role`. */
function toPublicUser(row: RawUser): PublicUser {
  return { ...row, role: row.role as Role };
}

export const userRepository = {
  /** Full record including passwordHash — used only for auth (login). */
  findByEmailWithHash(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<PublicUser | null> {
    const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    return user ? toPublicUser(user) : null;
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<PublicUser> {
    const user = await prisma.user.create({ data, select: publicUserSelect });
    return toPublicUser(user);
  },

  async update(
    id: string,
    data: Partial<{ name: string; email: string; role: Role }>,
  ): Promise<PublicUser> {
    const user = await prisma.user.update({ where: { id }, data, select: publicUserSelect });
    return toPublicUser(user);
  },

  async delete(id: string): Promise<PublicUser> {
    const user = await prisma.user.delete({ where: { id }, select: publicUserSelect });
    return toPublicUser(user);
  },

  /** Admin: list all users with a task count, most recent first. */
  async listAll(): Promise<Array<PublicUser & { taskCount: number }>> {
    const users = await prisma.user.findMany({
      select: { ...publicUserSelect, _count: { select: { tasks: true } } },
      orderBy: { createdAt: "desc" },
    });
    type RawUserWithCount = RawUser & { _count: { tasks: number } };
    return (users as RawUserWithCount[]).map((u) => {
      const { _count, ...rest } = u;
      return { ...toPublicUser(rest), taskCount: _count.tasks };
    });
  },

  count() {
    return prisma.user.count();
  },
};
