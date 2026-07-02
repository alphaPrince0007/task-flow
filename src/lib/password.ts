/**
 * Password hashing utilities.
 *
 * We use bcrypt (via bcryptjs, a pure-JS implementation that needs no native
 * build step). bcrypt is deliberately slow and salts each hash automatically,
 * which makes offline brute-forcing of leaked hashes expensive. Plaintext
 * passwords are never stored or logged.
 *
 * 10 rounds is a sensible default: strong enough to be costly for attackers,
 * fast enough not to bottleneck logins.
 */
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

/** Hash a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Constant-time comparison of a plaintext password against a stored hash. */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
