"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PREVIEW_TASKS = [
  { label: "Design review — checkout flow", status: "done", priority: "High" },
  { label: "Migrate API to v1 namespace", status: "in-progress", priority: "High" },
  { label: "Write RBAC integration tests", status: "in-progress", priority: "Medium" },
  { label: "Draft Q3 onboarding docs", status: "todo", priority: "Low" },
];

const STATUS_ICON = {
  done: CheckCircle2,
  "in-progress": Clock,
  todo: Circle,
} as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      {/* gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.25),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-40 -z-10 h-72 w-72 -translate-x-[140%] rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-64 -z-10 h-72 w-72 translate-x-[60%] rounded-full bg-success/20 blur-3xl"
      />

      <div className="mx-auto max-w-6xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Next.js 15 · TypeScript · Prisma · JWT + RBAC
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Task management,{" "}
          <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
            built like real software
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
        >
          Secure auth, role-based access, and a versioned REST API behind a
          clean dashboard — the foundation teams actually ship on top of.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/api/docs">
            <Button size="lg" variant="outline">View API docs</Button>
          </Link>
        </motion.div>

        {/* Animated dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="rounded-xl border bg-card/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
            <div className="flex items-center gap-1.5 border-b px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-muted-foreground">taskflow.app/dashboard</span>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {[
                { label: "Open tasks", value: "24" },
                { label: "In progress", value: "8" },
                { label: "Completed", value: "142" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="rounded-lg border bg-background/60 p-4 text-left"
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-2 px-5 pb-5 text-left">
              {PREVIEW_TASKS.map((task, i) => {
                const Icon = STATUS_ICON[task.status as keyof typeof STATUS_ICON];
                return (
                  <motion.div
                    key={task.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-lg border bg-background/40 px-3 py-2.5"
                  >
                    <Icon
                      className={
                        task.status === "done"
                          ? "h-4 w-4 shrink-0 text-success"
                          : task.status === "in-progress"
                            ? "h-4 w-4 shrink-0 text-primary"
                            : "h-4 w-4 shrink-0 text-muted-foreground"
                      }
                    />
                    <span className="flex-1 truncate text-sm">{task.label}</span>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      {task.priority}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* floating accent badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 1.2, duration: 0.4 }, scale: { delay: 1.2, duration: 0.4 }, y: { delay: 1.6, duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute -left-6 top-10 hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            JWT verified
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
            transition={{ opacity: { delay: 1.4, duration: 0.4 }, scale: { delay: 1.4, duration: 0.4 }, y: { delay: 1.8, duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute -right-6 bottom-16 hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Task completed
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
