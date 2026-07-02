import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config. Path alias mirrors tsconfig so tests can import via "@/…".
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
