/**
 * Cookie helpers for auth tokens.
 *
 * Tokens live in HTTP-only cookies (not localStorage) so that client-side JS —
 * and therefore any XSS payload — cannot read them. Flags used:
 *   • httpOnly  — not accessible from document.cookie
 *   • sameSite=lax — sent on top-level navigations, blocks most CSRF
 *   • secure    — HTTPS-only in production
 *   • path=/    — available to the whole app
 */
import { cookies } from "next/headers";
import { COOKIE } from "@/config/constants";
import { isProduction } from "@/config/env";

const ACCESS_MAX_AGE = 15 * 60; // 15 minutes, matches ACCESS_TOKEN_TTL
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, matches REFRESH_TOKEN_TTL

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
};

/** Persist both tokens as HTTP-only cookies. */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(COOKIE.ACCESS_TOKEN, accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE });
  store.set(COOKIE.REFRESH_TOKEN, refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE });
}

/** Remove both auth cookies (logout). */
export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(COOKIE.ACCESS_TOKEN);
  store.delete(COOKIE.REFRESH_TOKEN);
}
