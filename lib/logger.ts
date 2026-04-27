type LogLevel = "error" | "warn";

async function persistToDb(
  level: LogLevel,
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
) {
  try {
    const { db } = await import("./db");
    await db.appError.create({
      data: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        message,
        stack: error instanceof Error ? (error.stack ?? null) : null,
        route: (context?.path as string) ?? null,
        userId: (context?.userId as string) ?? null,
        context: context ? JSON.stringify(context) : null,
        level,
      },
    });
  } catch {
    // Never throw from logger
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log("[TradeMind:INFO]", message, context ?? "");
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn("[TradeMind:WARN]", message, context ?? "");
    persistToDb("warn", message, undefined, context);
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error("[TradeMind:ERROR]", message, error ?? "", context ?? "");
    persistToDb("error", message, error, context);
  },
};