/**
 * POST /api/v1/auth/register
 * Create a new account and log the user in (sets auth cookies).
 */
import type { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { registerSchema } from "@/lib/validation";
import { setAuthCookies } from "@/lib/cookies";
import { created, handleError } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { BadRequest } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    // Throttle: 10 registrations per IP per 15 minutes.
    const ip = getClientIp(req.headers);
    const limit = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      throw BadRequest(`Too many attempts. Try again in ${limit.retryAfterSeconds}s.`);
    }

    const body = await req.json().catch(() => ({}));
    const input = registerSchema.parse(body); // 400 on invalid input

    const { user, accessToken, refreshToken } = await authService.register(input);
    await setAuthCookies(accessToken, refreshToken);

    return created({ user }, "Account created successfully");
  } catch (error) {
    return handleError(error);
  }
}
