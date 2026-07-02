"use client";

/**
 * DashboardNav — responsive sidebar + top bar.
 *
 * Desktop: fixed sidebar. Mobile: a slide-in drawer toggled by a hamburger.
 * Admin-only links are shown only when the current user's role is ADMIN
 * (belt-and-suspenders — the API also enforces this). Includes a dark-mode
 * toggle and logout.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard, CheckSquare, User, Shield, LogOut, Menu, X, Moon, Sun,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

interface Props {
  user: { name: string; email: string; role: Role };
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, adminOnly: false },
  { href: "/profile", label: "Profile", icon: User, adminOnly: false },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  async function logout() {
    try {
      await api.post("/api/v1/auth/logout");
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  }

  const links = NAV.filter((l) => !l.adminOnly || user.role === "ADMIN");

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarBody = () => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <CheckSquare className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">TaskFlow</span>
      </div>

      <NavLinks />

      <div className="border-t pt-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
            {user.role}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={toggleTheme}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? "Light" : "Dark"}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CheckSquare className="h-4 w-4" />
          </div>
          <span className="font-semibold">TaskFlow</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full w-64 bg-card shadow-lg">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody />
          </div>
        </div>
      )}
    </>
  );
}
