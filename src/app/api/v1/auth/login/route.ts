/**
 * POST /api/v1/auth/login
 * Verify credentials and issue auth cookies.
 */
import type { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { loginSchema } from "@/lib/validation";
import { setAuthCookies } from "@/lib/cookies";
import { ok, handleError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { BadRequest } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    // Throttle brute force: 5 login attempts per IP per 15 minutes.
    const ip = getClientIp(req.headers);
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      throw BadRequest(`Too many attempts. Try again in ${limit.retryAfterSeconds}s.`);
    }

    const body = await req.json().catch(() => ({}));
    const input = loginSchema.parse(body);

    const { user, accessToken, refreshToken } = await authService.login(input);
    await setAuthCookies(accessToken, refreshToken);

    return ok({ user }, "Logged in successfully");
  } catch (error) {
    return handleError(error);
  }
}
