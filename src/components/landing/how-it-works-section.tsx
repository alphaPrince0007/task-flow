"use client";

import { motion } from "framer-motion";
import { UserPlus, ListChecks, Users } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create an account",
    body: "Register with email and password. Sessions are issued as short-lived JWTs in HTTP-only cookies.",
  },
  {
    icon: ListChecks,
    title: "Organize your work",
    body: "Create tasks with status and priority, then filter, sort, and paginate through the dashboard or API.",
  },
  {
    icon: Users,
    title: "Bring in your team",
    body: "Admins manage users and permissions; members see only what their role allows.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y bg-card/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-muted-foreground">
            Three steps from sign-up to a working, access-controlled task board.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block"
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-md">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">
                <span className="text-primary">{i + 1}.</span> {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
