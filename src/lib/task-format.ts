/**
 * Presentation helpers mapping task enum values to human labels and Badge
 * variants. Keeping this in one place ensures status/priority always render
 * consistently across the dashboard, table, and forms.
 */
import type { BadgeProps } from "@/components/ui/badge";

export function statusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Pending";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    default: return status;
  }
}

export function statusVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "COMPLETED": return "success";
    case "IN_PROGRESS": return "info";
    case "PENDING": return "warning";
    default: return "default";
  }
}

export function priorityVariant(priority: string): BadgeProps["variant"] {
  switch (priority) {
    case "HIGH": return "danger";
    case "MEDIUM": return "warning";
    case "LOW": return "default";
    default: return "default";
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
