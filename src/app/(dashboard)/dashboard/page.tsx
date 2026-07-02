"use client";

/**
 * Dashboard — at-a-glance stats plus recent tasks.
 *
 * Fetches aggregate counts and the latest tasks on mount. Shows skeletons while
 * loading and a friendly empty state when there are no tasks yet. Stats are
 * owner-scoped for users and global for admins (the API decides).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ListTodo, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { TaskStats, TaskListResponse, TaskDTO } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { statusLabel, statusVariant, priorityVariant, formatDate } from "@/lib/task-format";

export default function DashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recent, setRecent] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, list] = await Promise.all([
          api.get<{ stats: TaskStats }>("/api/v1/tasks/stats"),
          api.get<TaskListResponse>("/api/v1/tasks?limit=5&sortBy=createdAt&sortOrder=desc"),
        ]);
        setStats(s.stats);
        setRecent(list.tasks);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Total tasks", value: stats?.total, icon: ListTodo, tint: "text-primary" },
    { label: "Pending", value: stats?.pending, icon: Clock, tint: "text-warning" },
    { label: "In progress", value: stats?.inProgress, icon: Loader2, tint: "text-primary" },
    { label: "Completed", value: stats?.completed, icon: CheckCircle2, tint: "text-success" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your task overview at a glance.</p>
        </div>
        <Link href="/tasks"><Button>Go to tasks</Button></Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {loading || c.value === undefined
                  ? <Skeleton className="mt-2 h-8 w-12" />
                  : <p className="mt-1 text-3xl font-bold">{c.value}</p>}
              </div>
              <c.icon className={`h-8 w-8 ${c.tint}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ListTodo className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No tasks yet</p>
              <p className="text-sm text-muted-foreground">Create your first task to get started.</p>
              <Link href="/tasks" className="mt-4"><Button size="sm">Create a task</Button></Link>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">Due {formatDate(t.dueDate)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                    <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
