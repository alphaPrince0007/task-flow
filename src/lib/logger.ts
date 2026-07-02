/**
 * Minimal structured logger.
 *
 * A tiny wrapper around console that (a) timestamps every line, (b) tags a
 * level, and (c) emits JSON in production so logs are machine-parseable by
 * aggregators (Datadog, CloudWatch, etc.). In development it prints readable
 * lines. Swapping in pino/winston later means changing only this file.
 */
import { isProduction } from "@/config/env";

type Level = "info" | "warn" | "error";

function emit(level: Level, message: string, meta?: unknown) {
  const time = new Date().toISOString();

  if (isProduction) {
    // Structured single-line JSON for log processors.
    const record: Record<string, unknown> = { time, level, message };
    if (meta !== undefined) {
      record.meta = meta instanceof Error ? { name: meta.name, message: meta.message } : meta;
    }
    console[level === "info" ? "log" : level](JSON.stringify(record));
    return;
  }

  // Human-friendly output in development.
  const prefix = `[${time}] ${level.toUpperCase()}`;
  if (meta !== undefined) console[level === "info" ? "log" : level](prefix, message, meta);
  else console[level === "info" ? "log" : level](prefix, message);
}

export const logger = {
  info: (message: string, meta?: unknown) => emit("info", message, meta),
  warn: (message: string, meta?: unknown) => emit("warn", message, meta),
  error: (message: string, meta?: unknown) => emit("error", message, meta),
};
