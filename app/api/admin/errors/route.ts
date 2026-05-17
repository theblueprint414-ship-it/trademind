import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

type AppErrorRow = {
  id: string;
  message: string;
  stack: string | null;
  route: string | null;
  userId: string | null;
  context: string | null;
  level: string;
  createdAt: string;
};

type CountRow = { level: string; count: bigint };

const ALLOWED_LEVELS = new Set(["error", "warn", "info"]);

function checkSecret(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (header.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!checkSecret(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("level") ?? "error";
  const level = ALLOWED_LEVELS.has(raw) ? raw : "error";
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const [errors, counts] = await Promise.all([
    db.$queryRaw<AppErrorRow[]>`
      SELECT id, message, stack, route, userId, context, level, createdAt
      FROM AppError
      WHERE level = ${level}
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `,
    db.$queryRaw<CountRow[]>`
      SELECT level, COUNT(*) as count FROM AppError GROUP BY level
    `,
  ]);

  return Response.json({
    errors,
    counts: counts.map((r) => ({ level: r.level, count: Number(r.count) })),
    total: errors.length,
  });
}

export async function DELETE(req: NextRequest) {
  if (!checkSecret(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await db.$executeRaw`DELETE FROM AppError WHERE createdAt < datetime('now', '-30 days')`;

  return Response.json({ ok: true });
}