"use client";

/**
 * Profile page — view account details and update name/email.
 *
 * Loads the current profile on mount, then lets the user edit it. The email
 * field reuses the API's uniqueness rule: a collision comes back as a 409 and
 * is shown inline. Password change is intentionally out of scope for this
 * assignment (noted in the card) to keep the surface focused.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, User as UserIcon, Shield, Calendar } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import type { PublicUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/task-format";

export default function ProfilePage() {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ user: PublicUser }>("/api/v1/auth/me");
        setProfile(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const data = await api.patch<{ user: PublicUser }>("/api/v1/auth/me", { name, email });
      setProfile(data.user);
      toast.success("Profile updated");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.errors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.errors)) flat[k] = v[0]!;
          setErrors(flat);
        }
        toast.error(err.message);
      } else {
        toast.error("Update failed");
      }
    } finally {
      setSaving(false);
    }
  }

  const dirty = profile && (name !== profile.name || email !== profile.email);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : profile ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground" /> {profile.name}</div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profile.email}</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> Role: {profile.role}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Joined {formatDate(profile.createdAt)}</div>
                </dl>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
            <CardDescription>Update your name and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-28" />
              </div>
            ) : (
              <form onSubmit={save} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} error={!!errors.name} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" loading={saving} disabled={!dirty}>Save changes</Button>
              </form>
            )}

            <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
              Password changes are handled separately and are out of scope for this build.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
