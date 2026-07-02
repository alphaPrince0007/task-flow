"use client";

import { motion } from "framer-motion";

const STACK = [
  { name: "Next.js 15", detail: "App Router" },
  { name: "TypeScript", detail: "End-to-end types" },
  { name: "Prisma", detail: "Type-safe ORM" },
  { name: "PostgreSQL", detail: "Production DB" },
  { name: "JWT (jose)", detail: "Stateless auth" },
  { name: "Zod", detail: "Runtime validation" },
  { name: "Tailwind CSS", detail: "Styling" },
  { name: "Vitest", detail: "Unit testing" },
];

export function TechStackSection() {
  return (
    <section id="tech-stack" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A modern, boring-on-purpose stack
          </h2>
          <p className="mt-4 text-muted-foreground">
            No exotic dependencies — just tools that are well-documented,
            widely adopted, and easy to hand off to another engineer.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STACK.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-lg border bg-card p-4 text-center transition-colors hover:border-primary/50"
            >
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
