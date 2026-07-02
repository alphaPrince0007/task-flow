/**
 * JWT signing and verification.
 *
 * We use `jose` rather than `jsonwebtoken` because jose runs on the Edge
 * runtime, which Next.js middleware uses. That lets us verify tokens in
 * middleware (before a request ever reaches a route handler) with the same
 * code we use on the server.
 *
 * Two token types are issued:
 *   • access  — short-lived (15m), sent on every request
 *   • refresh — long-lived (7d), used only to mint a new access token
 *
 * Both are stored in HTTP-only cookies so client-side JavaScript (and thus
 * XSS payloads) cannot read them.
 */
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";
import type { JwtPayload, Role } from "@/types";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALG = "HS256";

interface TokenSubject {
  id: string;
  email: string;
  role: Role;
}

/** Create a signed access token (short-lived). */
export async function signAccessToken(user: TokenSubject): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role, type: "access" })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_TTL)
    .sign(secret);
}

/** Create a signed refresh token (long-lived). */
export async function signRefreshToken(user: TokenSubject): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role, type: "refresh" })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_TTL)
    .sign(secret);
}

/**
 * Verify a token's signature and expiry, returning its typed payload.
 * Throws if the token is invalid, tampered with, or expired — callers treat
 * a throw as "unauthenticated".
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] });
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
    type: payload.type as "access" | "refresh",
  };
}
