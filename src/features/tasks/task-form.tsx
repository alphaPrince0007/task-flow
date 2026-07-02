"use client";

/**
 * TaskForm — shared create/edit form rendered inside a Dialog.
 *
 * One component handles both modes: when `task` is provided it pre-fills and
 * PATCHes; otherwise it POSTs a new task. Validation uses the same Zod schema
 * as the API. On success it calls onSaved so the parent can refresh the list.
 */
import { useState } from "react";
import { toast } from "sonner";
import { api, ApiClientError } from "@/lib/api-client";
import { TASK_STATUS, TASK_PRIORITY } from "@/config/constants";
import type { TaskDTO } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  task?: TaskDTO | null;
  onSaved: () => void;
  onCancel: () => void;
}

/** Format a date for the <input type="date"> value (yyyy-mm-dd). */
function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function TaskForm({ task, onSaved, onCancel }: Props) {
  const isEdit = Boolean(task);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? TASK_STATUS.PENDING,
    priority: task?.priority ?? TASK_PRIORITY.MEDIUM,
    dueDate: toDateInput(task?.dueDate),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Build payload; omit empty dueDate rather than sending "".
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    try {
      if (isEdit && task) {
        await api.patch(`/api/v1/tasks/${task.id}`, payload);
        toast.success("Task updated");
      } else {
        await api.post("/api/v1/tasks", payload);
        toast.success("Task created");
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.errors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.errors)) flat[k] = v[0]!;
          setErrors(flat);
        }
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)}
          error={!!errors.title} placeholder="What needs doing?" />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional details…" />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={form.status} onChange={(e) => update("status", e.target.value as typeof form.status)}>
            <option value={TASK_STATUS.PENDING}>Pending</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.COMPLETED}>Completed</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" value={form.priority} onChange={(e) => update("priority", e.target.value as typeof form.priority)}>
            <option value={TASK_PRIORITY.LOW}>Low</option>
            <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
            <option value={TASK_PRIORITY.HIGH}>High</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due date</Label>
        <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{isEdit ? "Save changes" : "Create task"}</Button>
      </div>
    </form>
  );
}
