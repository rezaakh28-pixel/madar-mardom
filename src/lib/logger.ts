// ---------------------------------------------------------------------------
// Minimal structured logger for مدار مردم.
// Swap the `write` implementation for a real sink (e.g. a log-shipping
// service, Sentry, or a database table) without touching call sites.
// ---------------------------------------------------------------------------

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const serialized = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(serialized);
      break;
    case "warn":
      console.warn(serialized);
      break;
    default:
      console.log(serialized);
  }

  // TODO: ship `entry` to a persistent store / monitoring service in production.
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),

  /** Convenience helper for auditable actions (publish, role change, login, etc). */
  audit: (action: string, actorId: string, fields?: LogFields) =>
    write("info", `audit:${action}`, { actorId, ...fields }),
};
