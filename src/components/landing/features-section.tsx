"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, CheckSquare, Layers, GitBranch, Gauge, LockKeyhole,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "JWT auth in HTTP-only cookies, bcrypt-hashed passwords, and CSRF-aware middleware out of the box.",
  },
  {
    icon: LockKeyhole,
    title: "Role-based access control",
    body: "Admin, member, and viewer roles enforced at the service layer — not just hidden in the UI.",
  },
  {
    icon: CheckSquare,
    title: "Full task CRUD",
    body: "Create, filter, sort, and paginate tasks with status and priority tracking baked in.",
  },
  {
    icon: GitBranch,
    title: "Versioned REST API",
    body: "A stable /api/v1 surface with OpenAPI docs, so clients don't break as the product evolves.",
  },
  {
    icon: Layers,
    title: "Clean architecture",
    body: "Service and repository layers separate business rules from persistence — easy to test, easy to extend.",
  },
  {
    icon: Gauge,
    title: "Built to scale",
    body: "Stateless auth and modular data access make horizontal scaling and caching a drop-in addition.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a real product needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            Not a to-do toy — a foundation with the auth, access control, and
            API design decisions already made correctly.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
