/**
 * Centralized, validated environment configuration.
 *
 * Reading process.env directly throughout a codebase is error-prone: a typo
 * or missing variable fails silently at runtime. Here we parse and validate
 * everything once, at startup, with Zod. If the environment is misconfigured
 * the app refuses to boot with a clear message — fail fast, not mysteriously.
 *
 * Import `env` anywhere instead of touching process.env.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Surface a readable list of what's wrong, then stop.
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `❌ Invalid environment configuration:\n${issues}\n` +
      `Copy .env.example to .env and fill in the values.`,
  );
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
