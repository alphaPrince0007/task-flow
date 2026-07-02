import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminClient } from "./admin-client";

/**
 * Admin page (server component). Enforces admin access before rendering — a
 * non-admin who somehow reaches this route is redirected. This is the page-level
 * guard; the underlying admin APIs independently enforce the same rule, so
 * access control never depends on the UI alone.
 */
export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }
  return <AdminClient />;
}
