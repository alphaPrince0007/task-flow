/**
 * Unit tests for password hashing.
 *
 * Verifies the two guarantees callers rely on: a hash never equals the
 * plaintext, and verifyPassword accepts the right password while rejecting the
 * wrong one. These are the properties that keep stored credentials safe.
 */
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("produces a hash that is not the plaintext", async () => {
    const hash = await hashPassword("Secret123");
    expect(hash).not.toBe("Secret123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("Secret123");
    expect(await verifyPassword("Secret123", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Secret123");
    expect(await verifyPassword("WrongPass9", hash)).toBe(false);
  });

  it("generates different hashes for the same input (salting)", async () => {
    const a = await hashPassword("Secret123");
    const b = await hashPassword("Secret123");
    expect(a).not.toBe(b); // unique salt per hash
  });
});
