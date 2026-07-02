"use client";

/**
 * AdminClient — the interactive admin console.
 *
 * Lists all users with their task counts, lets an admin change a user's role
 * (inline select) or delete a user (with confirmation). Also shows platform-
 * wide task stats. The self-protection rules (can't delete or demote yourself)
 * live in the API and surface here as toast errors, so the UI stays simple.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, ShieldCheck, ListTodo, Trash2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { ROLES } from "@/config/constants";
import type { AdminUser, TaskStats } from "@/types/client";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/task-format";

export function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        api.get<{ users: AdminUser[] }>("/api/v1/users"),
        api.get<{ stats: TaskStats }>("/api/v1/tasks/stats"),
      ]);
      setUsers(u.users);
      setStats(s.stats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(user: AdminUser, role: Role) {
    if (role === user.role) return;
    setRoleBusyId(user.id);
    try {
      await api.patch(`/api/v1/users/${user.id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
      toast.success(`${user.name} is now ${role}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not change role");
    } finally {
      setRoleBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.delete(`/api/v1/users/${deleting.id}`);
      toast.success(`Deleted ${deleting.name}`);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not delete user");
    } finally {
      setDeletingBusy(false);
    }
  }

  const adminCount = useMemo(() => users.filter((u) => u.role === ROLES.ADMIN).length, [users]);

  const statCards = [
    { label: "Total users", value: users.length, icon: Users },
    { label: "Admins", value: adminCount, icon: ShieldCheck },
    { label: "Total tasks", value: stats?.total ?? 0, icon: ListTodo },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin console</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, and view platform activity.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {loading ? <Skeleton className="mt-2 h-8 w-10" /> : <p className="mt-1 text-3xl font-bold">{c.value}</p>}
              </div>
              <c.icon className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Tasks</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={6} className="px-3 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                  ))
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-accent/40">
                      <td className="px-3 py-3 font-medium">{u.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-3 py-3">{u.taskCount}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={u.role === ROLES.ADMIN ? "info" : "default"}>{u.role}</Badge>
                          <Select
                            value={u.role}
                            disabled={roleBusyId === u.id}
                            onChange={(e) => changeRole(u, e.target.value as Role)}
                            className="h-8 w-28 text-xs"
                            aria-label={`Change role for ${u.name}`}
                          >
                            <option value={ROLES.USER}>User</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                          </Select>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete user?"
        description="This permanently removes the user and all their tasks."
      >
        <p className="text-sm">
          Delete <span className="font-medium">{deleting?.name}</span> ({deleting?.email})?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingBusy} onClick={confirmDelete}>Delete user</Button>
        </div>
      </Dialog>
    </div>
  );
}
