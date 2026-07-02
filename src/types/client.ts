/** Task shape as returned to the client (dates arrive as ISO strings). */
import type { PublicUser, PaginationMeta, TaskStatus, TaskPriority } from "@/types";

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface TaskListResponse {
  tasks: TaskDTO[];
  pagination: PaginationMeta;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface AdminUser extends PublicUser {
  taskCount: number;
}
