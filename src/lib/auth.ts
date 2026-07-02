/**
 * Server-side authentication & authorization guards.
 *
 * These are the functions route handlers call to enforce access control:
 *   • getCurrentUser  — returns the authed user or null (no throw)
 *   • requireAuth     — returns the authed user or throws 401
 *   • requireAdmin    — returns the user or throws 403 if not an admin
 *
 * This is the single choke point for RBAC on the API. Authorization is checked
 * on the server for every protected route — never trusting the client — so even
 * if someone crafts requests directly against the API, the rules still hold.
 */
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { Unauthorized, Forbidden } from "@/lib/errors";
import { COOKIE, ROLES } from "@/config/constants";
import type { AuthUser } from "@/types";

/**
 * Resolve the current user from the access-token cookie.
 * Returns null when there is no valid token (used where auth is optional).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE.ACCESS_TOKEN)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    if (payload.type !== "access") return null; // refresh tokens can't authorize requests
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Expired / tampered / malformed token → treat as unauthenticated.
    return null;
  }
}

/** Require a logged-in user; throw 401 otherwise. */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw Unauthorized("Authentication required");
  return user;
}

/** Require an admin; throw 401 if not logged in, 403 if not an admin. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== ROLES.ADMIN) throw Forbidden("Admin access required");
  return user;
}
