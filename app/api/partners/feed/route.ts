import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// GET /api/partners/feed — recent activity from all partners
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const partnerships = await db.partnership.findMany({
    where: {
      status: "active",
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });

  const partnerIds = partnerships.map((p) =>
    p.userAId === userId ? p.userBId : p.userAId
  );

  // Include self in feed
  const allIds = [userId, ...partnerIds];

  const checkins = await db.checkin.findMany({
    where: { userId: { in: allIds } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const feed = checkins.map((c) => ({
    userId: c.userId,
    name: c.userId === userId ? "You" : (c.user.name ?? c.user.email),
    score: c.score,
    verdict: c.verdict,
    date: c.date,
    time: formatRelative(c.createdAt),
    isSelf: c.userId === userId,
  }));

  return Response.json({ feed });
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor(diff / (1000 * 60));
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}
