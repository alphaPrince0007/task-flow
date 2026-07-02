"use client";

/**
 * Register page. Mirrors login: shared Zod schema, typed API client, and
 * server-side field errors mapped back onto the form so validation feedback is
 * precise (e.g. "email already in use").
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      await api.post("/api/v1/auth/register", values);
      toast.success("Account created!");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Map field-level errors from the API onto the form.
        if (err.errors) {
          for (const [field, messages] of Object.entries(err.errors)) {
            setError(field as keyof RegisterInput, { message: messages[0] });
          }
        }
        toast.error(err.message);
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Start managing your tasks in seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" placeholder="Jane Doe"
              error={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
              error={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
              error={!!errors.password} {...register("password")} />
            {errors.password
              ? <p className="text-sm text-destructive">{errors.password.message}</p>
              : <p className="text-xs text-muted-foreground">Must include a letter and a number.</p>}
          </div>

          <Button type="submit" className="w-full" loading={submitting}>Create account</Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
