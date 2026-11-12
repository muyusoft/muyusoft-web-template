type LogLevel = "debug" | "info" | "warn" | "error";

const IS_DEV = process.env.NODE_ENV !== "production";

function write(level: LogLevel, message: string, data?: unknown): void {
  if (level === "debug" && !IS_DEV) return;
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
  console[level](prefix, message, data ?? "");
  // TODO: forward warn/error to Sentry (or similar) in production.
}

export const logger = {
  debug: (message: string, data?: unknown) => write("debug", message, data),
  info: (message: string, data?: unknown) => write("info", message, data),
  warn: (message: string, data?: unknown) => write("warn", message, data),
  error: (message: string, data?: unknown) => write("error", message, data),
};
