"use client";

/**
 * Tasks page — the main CRUD surface.
 *
 * Features: debounced search, status/priority filters, sortable columns,
 * pagination, and create/edit/delete via a shared dialog. State that affects
 * the query (page, search, filters, sort) triggers a refetch. The table
 * collapses into cards on mobile so it stays usable on small screens.
 *
 * Admins see every task (with an owner column); regular users see only their
 * own — the API enforces that scope, this page just renders what it receives.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, ListTodo,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { TASK_STATUS, TASK_PRIORITY } from "@/config/constants";
import type { TaskDTO, TaskListResponse } from "@/types/client";
import type { PaginationMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/features/tasks/task-form";
import { statusLabel, statusVariant, priorityVariant, formatDate } from "@/lib/task-format";

type SortField = "createdAt" | "dueDate" | "priority" | "title";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);
  const [deleting, setDeleting] = useState<TaskDTO | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  // Debounce the search box so we don't fire a request per keystroke.
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // new search resets to first page
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "10");
    p.set("sortBy", sortBy);
    p.set("sortOrder", sortOrder);
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (status) p.set("status", status);
    if (priority) p.set("priority", priority);
    return p.toString();
  }, [page, sortBy, sortOrder, debouncedSearch, status, priority]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<TaskListResponse>(`/api/v1/tasks?${queryString}`);
      setTasks(data.tasks);
      setMeta(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditing(task);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.delete(`/api/v1/tasks/${deleting.id}`);
      setDeleting(null);
      // If we just removed the last row on a page > 1, step back a page.
      if (tasks.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchTasks();
    } finally {
      setDeletingBusy(false);
    }
  }

  const hasFilters = Boolean(debouncedSearch || status || priority);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">Create, track, and manage your work.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="sm:w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value={TASK_STATUS.PENDING}>Pending</option>
          <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
          <option value={TASK_STATUS.COMPLETED}>Completed</option>
        </Select>
        <Select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="sm:w-44" aria-label="Filter by priority">
          <option value="">All priorities</option>
          <option value={TASK_PRIORITY.LOW}>Low</option>
          <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
          <option value={TASK_PRIORITY.HIGH}>High</option>
        </Select>
      </div>

      {/* Table (desktop) */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">
                  <button onClick={() => toggleSort("title")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Title <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <button onClick={() => toggleSort("priority")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Priority <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button onClick={() => toggleSort("dueDate")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Due <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3" colSpan={5}><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <EmptyState hasFilters={hasFilters} onCreate={openCreate} />
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="line-clamp-1 text-xs text-muted-foreground">{t.description}</p>}
                      {t.user && <p className="text-xs text-muted-foreground">by {t.user.name}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(t.dueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit task">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(t)} aria-label="Delete task">
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
      </Card>

      {/* Cards (mobile) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : tasks.length === 0 ? (
          <Card><CardContent className="py-10"><EmptyState hasFilters={hasFilters} onCreate={openCreate} /></CardContent></Card>
        ) : (
          tasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{t.title}</p>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit task"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(t)} aria-label="Delete task"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  <span className="text-xs text-muted-foreground">Due {formatDate(t.dueDate)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} task{meta.total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / edit dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit task" : "New task"}
        description={editing ? "Update the details below." : "Add a task to your list."}
      >
        <TaskForm
          task={editing}
          onSaved={() => { setFormOpen(false); fetchTasks(); }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete task?"
        description="This action cannot be undone."
      >
        <p className="text-sm">
          Are you sure you want to delete <span className="font-medium">{deleting?.title}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingBusy} onClick={confirmDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}

/** Empty state shown when there are no tasks (or no matches for filters). */
function EmptyState({ hasFilters, onCreate }: { hasFilters: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <ListTodo className="h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-medium">{hasFilters ? "No matching tasks" : "No tasks yet"}</p>
      <p className="text-sm text-muted-foreground">
        {hasFilters ? "Try adjusting your search or filters." : "Create your first task to get started."}
      </p>
      {!hasFilters && (
        <Button size="sm" className="mt-4" onClick={onCreate}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      )}
    </div>
  );
}
