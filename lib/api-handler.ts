import { NextRequest } from "next/server";
import { logger } from "./logger";

type RouteHandler = (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>;

/**
 * Wraps an API route handler with consistent error handling and Sentry reporting.
 * Prevents unhandled promise rejections from leaking raw stack traces to clients.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      logger.error("Unhandled API error", error, {
        method: req.method,
        path: req.nextUrl.pathname,
      });
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}