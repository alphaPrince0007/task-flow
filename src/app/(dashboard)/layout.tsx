import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { DashboardNav } from "@/components/dashboard-nav";

/**
 * Layout for all authenticated pages. This is a server component: it resolves
 * the current user once (throwing → redirect to /login) and passes the minimal
 * profile down to the client-side nav. Every child page can therefore assume
 * an authenticated session.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const auth = await requireAuth();
    user = await userService.getProfile(auth.id);
  } catch {
    redirect("/login");
  }
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={{ name: user.name, email: user.email, role: user.role }} />
      {/* pt-14 clears the mobile top bar; lg screens have no top bar. */}
      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
