"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "The RBAC layer is exactly what I'd want to inherit — enforced in the service layer, not bolted onto the UI as an afterthought.",
    name: "Alex Rivera",
    role: "Backend Engineer",
  },
  {
    quote:
      "Clean separation between services and repositories made it trivial to add caching without touching a single route handler.",
    name: "Priya Nair",
    role: "Tech Lead",
  },
  {
    quote:
      "Versioned endpoints and generated OpenAPI docs meant our mobile team could start integrating before the UI was even done.",
    name: "Jordan Lee",
    role: "Full-Stack Developer",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What developers say
          </h2>
          <p className="mt-4 text-muted-foreground">
            Illustrative feedback on the architecture and design decisions behind TaskFlow.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <Quote className="h-6 w-6 text-primary/40" />
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                    {t.quote}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
