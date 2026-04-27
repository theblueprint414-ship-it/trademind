import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Protected by CRON_SECRET — same token used for cron jobs
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level") ?? "error";
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const errors = await db.$queryRawUnsafe<
    { id: string; message: string; stack: string | null; route: string | null; userId: string | null; context: string | null; level: string; createdAt: string }[]
  >(
    `SELECT id, message, stack, route, userId, context, level, createdAt
     FROM AppError
     WHERE level = ?
     ORDER BY createdAt DESC
     LIMIT ?`,
    level,
    limit
  );

  const counts = await db.$queryRawUnsafe<{ level: string; count: number }[]>(
    `SELECT level, COUNT(*) as count FROM AppError GROUP BY level`
  );

  return Response.json({ errors, counts, total: errors.length });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete errors older than 30 days
  await db.$executeRawUnsafe(
    `DELETE FROM AppError WHERE createdAt < datetime('now', '-30 days')`
  );

  return Response.json({ ok: true });
}