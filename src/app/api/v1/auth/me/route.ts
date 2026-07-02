/**
 * GET   /api/v1/auth/me   → current user's profile
 * PATCH /api/v1/auth/me   → update current user's profile
 */
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { updateProfileSchema } from "@/lib/validation";
import { ok, handleError } from "@/lib/api-response";
import { NotFound } from "@/lib/errors";

export async function GET() {
  try {
    const actor = await requireAuth();
    const profile = await userService.getProfile(actor.id);
    if (!profile) throw NotFound("User not found");
    return ok({ user: profile }, "Profile fetched");
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const input = updateProfileSchema.parse(body);
    const user = await userService.updateProfile(actor.id, input);
    return ok({ user }, "Profile updated");
  } catch (error) {
    return handleError(error);
  }
}
