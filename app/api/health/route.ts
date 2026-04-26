export const runtime = "nodejs";

import { db } from "@/lib/db";

export async function GET() {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      db: "ok",
      latencyMs: Date.now() - start,
      ts: new Date().toISOString(),
    });
  } catch {
    return Response.json({ status: "error", db: "unreachable", ts: new Date().toISOString() }, { status: 503 });
  }
}