export async function onRequestError(
  error: { digest: string } & Error,
  request: { path: string; method: string },
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { db } = await import("./lib/db");
    await db.appError.create({
      data: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        message: error.message ?? "Unknown error",
        stack: error.stack ?? null,
        route: `${request.method} ${request.path}`,
        level: "error",
        context: JSON.stringify({ digest: error.digest }),
      },
    });
  } catch {
    // Never throw from error handler
  }
}