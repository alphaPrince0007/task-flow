/**
 * Edge middleware — first line of access control.
 *
 * Runs before any page/route handler. It does two jobs:
 *   1. Protects dashboard pages: an unauthenticated visitor to /dashboard,
 *      /tasks, /profile, or /admin is redirected to /login.
 *   2. Keeps logged-in users away from /login and /register (sends them to the
 *      dashboard).
 *
 * Token *authorization* for API routes is still enforced server-side in each
 * handler via requireAuth/requireAdmin — middleware here is about page
 * navigation UX and defense-in-depth, not the only gate. We verify the JWT
 * with `jose`, which runs on the Edge runtime.
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { COOKIE } from "@/config/constants";

const PROTECTED_PREFIXES = ["/dashboard", "/tasks", "/profile", "/admin"];
const AUTH_PAGES = ["/login", "/register"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE.ACCESS_TOKEN)?.value;
  if (!token) return false;
  try {
    const payload = await verifyToken(token);
    return payload.type === "access";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthenticated(req);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Only run middleware on app pages, not on API routes or static assets.
 * API auth is handled inside the route handlers themselves.
 */
export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"],
};
