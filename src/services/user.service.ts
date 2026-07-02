/**
 * User service — profile self-service plus admin user management.
 *
 * Guard rails encoded here:
 *   • Changing an email checks for collisions (409).
 *   • An admin cannot delete their own account or demote themselves — this
 *     prevents an admin from accidentally locking every admin out of the
 *     system. These are business rules, so they live in the service, not the
 *     route.
 */
import { userRepository } from "@/repositories/user.repository";
import { Conflict, NotFound, BadRequest } from "@/lib/errors";
import { ROLES } from "@/config/constants";
import type { UpdateProfileInput, UpdateRoleInput } from "@/lib/validation";
import type { AuthUser } from "@/types";

export const userService = {
  getProfile(userId: string) {
    return userRepository.findById(userId);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.email) {
      const existing = await userRepository.findByEmailWithHash(input.email);
      if (existing && existing.id !== userId) {
        throw Conflict("That email is already in use");
      }
    }
    return userRepository.update(userId, input);
  },

  // ── Admin operations ───────────────────────────────────────────────────────

  listAllUsers() {
    return userRepository.listAll();
  },

  async updateRole(targetUserId: string, input: UpdateRoleInput, actor: AuthUser) {
    const target = await userRepository.findById(targetUserId);
    if (!target) throw NotFound("User not found");

    // Don't let the last-acting admin strip their own admin rights.
    if (target.id === actor.id && input.role !== ROLES.ADMIN) {
      throw BadRequest("You cannot change your own admin role");
    }

    return userRepository.update(targetUserId, { role: input.role });
  },

  async deleteUser(targetUserId: string, actor: AuthUser) {
    if (targetUserId === actor.id) {
      throw BadRequest("You cannot delete your own account");
    }
    const target = await userRepository.findById(targetUserId);
    if (!target) throw NotFound("User not found");

    await userRepository.delete(targetUserId); // tasks cascade via the schema
  },
};
