/**
 * Unit tests for validation schemas.
 *
 * These lock down the input contract: weak passwords and bad emails are
 * rejected, unknown fields are stripped (mass-assignment defense), and query
 * defaults are applied. If someone loosens a rule by accident, a test fails.
 */
import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "@/lib/validation";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "JANE@example.com",
      password: "Passw0rd",
    });
    expect(result.success).toBe(true);
    // Email is normalized to lowercase.
    if (result.success) expect(result.data.email).toBe("jane@example.com");
  });

  it("rejects a password with no number", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "onlyletters",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      password: "Passw0rd",
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields (mass-assignment defense)", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "Passw0rd",
      role: "ADMIN", // attacker tries to self-assign admin
    });
    expect(result.success).toBe(true);
    if (result.success) expect("role" in result.data).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("createTaskSchema", () => {
  it("applies defaults for status and priority", () => {
    const result = createTaskSchema.safeParse({ title: "Do the thing" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("PENDING");
      expect(result.data.priority).toBe("MEDIUM");
    }
  });

  it("rejects an empty title", () => {
    expect(createTaskSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects an invalid status enum", () => {
    const result = createTaskSchema.safeParse({ title: "x", status: "DONE" });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("requires at least one field", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a partial update", () => {
    expect(updateTaskSchema.safeParse({ status: "COMPLETED" }).success).toBe(true);
  });
});

describe("taskQuerySchema", () => {
  it("coerces string query params and applies defaults", () => {
    const result = taskQuerySchema.safeParse({ page: "2", limit: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(5);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("caps limit at the maximum", () => {
    const result = taskQuerySchema.safeParse({ limit: "9999" });
    expect(result.success).toBe(false); // exceeds MAX_LIMIT
  });
});
