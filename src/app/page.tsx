import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CheckSquare, Shield, Zap } from "lucide-react";

/**
 * Landing page. If already authenticated, skip straight to the dashboard;
 * otherwise present a concise product intro with clear entry points.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const features = [
    { icon: Shield, title: "Secure by default", body: "JWT auth in HTTP-only cookies, bcrypt-hashed passwords, and role-based access." },
    { icon: CheckSquare, title: "Full task CRUD", body: "Create, filter, sort, and paginate tasks with status and priority tracking." },
    { icon: Zap, title: "Built to scale", body: "Modular services and repositories, ready for caching and horizontal scaling." },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
        Next.js 15 · TypeScript · Prisma · JWT
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        TaskFlow
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        A scalable task management system with authentication and role-based
        access control — built like a small SaaS backend, not a to-do toy.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/register"><Button size="lg">Get started</Button></Link>
        <Link href="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-6 text-left">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <Link href="/api/docs" className="mt-12 text-sm text-primary underline-offset-4 hover:underline">
        View the API documentation →
      </Link>
    </main>
  );
}
