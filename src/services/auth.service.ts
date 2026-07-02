/**
 * Auth service — business logic for registration and login.
 *
 * Services own the rules; route handlers stay thin. Notable decisions:
 *   • Registration rejects duplicate emails with 409.
 *   • Login uses one generic "Invalid email or password" message for both the
 *     "no such user" and "wrong password" cases, so an attacker can't use the
 *     response to discover which emails are registered (user enumeration).
 *   • Tokens are minted here; cookie-setting is handled by the route (which
 *     owns the HTTP response).
 */
import { userRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { Conflict, Unauthorized } from "@/lib/errors";
import { ROLES } from "@/config/constants";
import type { RegisterInput, LoginInput } from "@/lib/validation";
import type { PublicUser } from "@/types";

interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmailWithHash(input.email);
    if (existing) throw Conflict("An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: ROLES.USER, // new accounts are always USER; role changes are admin-only
    });

    return this.issueTokens(user);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const record = await userRepository.findByEmailWithHash(input.email);
    // Generic failure for both branches → no user enumeration.
    if (!record) throw Unauthorized("Invalid email or password");

    const valid = await verifyPassword(input.password, record.passwordHash);
    if (!valid) throw Unauthorized("Invalid email or password");

    const user: PublicUser = {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role as PublicUser["role"],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return this.issueTokens(user);
  },

  /** Sign a fresh access/refresh pair for a user. */
  async issueTokens(user: PublicUser): Promise<AuthResult> {
    const subject = { id: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(subject),
      signRefreshToken(subject),
    ]);
    return { user, accessToken, refreshToken };
  },
};
