"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "100%", label: "TypeScript coverage" },
  { value: "20+", label: "Versioned REST endpoints" },
  { value: "3", label: "Role-based access tiers" },
  { value: "0", label: "External auth dependencies" },
];

export function StatsSection() {
  return (
    <section className="border-y bg-card/40 px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center sm:grid-cols-4"
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
