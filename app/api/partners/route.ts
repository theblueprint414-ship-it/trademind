import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { logger } from "@/lib/logger";

// GET /api/partners — list accepted partners with latest checkin
export async function GET() {
  const guard = await requirePlan(["pro", "premium"]);
  // Soft gate — return empty list instead of 403 so dashboard renders normally
  if (!guard.ok) {
    if (guard.response.status === 401) return guard.response;
    return Response.json({ partners: [] });
  }
  const userId = guard.userId;

  try {
    const partnerships = await db.partnership.findMany({
      where: {
        status: "active",
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, name: true, email: true, image: true } },
        userB: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    const today = new Date().toISOString().split("T")[0];

    const partners = await Promise.all(
      partnerships.map(async (p) => {
        const partner = p.userAId === userId ? p.userB : p.userA;
        const latestCheckin = await db.checkin.findFirst({
          where: { userId: partner.id },
          orderBy: { date: "desc" },
        });
        const streak = await getStreak(partner.id);

        return {
          id: partner.id,
          name: partner.name ?? partner.email,
          email: partner.email,
          avatar: getAvatar(partner.name ?? partner.email ?? ""),
          score: latestCheckin?.score ?? null,
          verdict: latestCheckin?.verdict ?? null,
          streak,
          lastCheckin: latestCheckin
            ? latestCheckin.date === today
              ? "Today"
              : formatRelative(latestCheckin.date)
            : "Never",
        };
      })
    );

    return Response.json({ partners });
  } catch (err) {
    logger.error("Partners GET failed", err, { userId });
    return Response.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

// DELETE /api/partners?partnerId=xxx — remove a partnership
export async function DELETE(request: Request) {
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partnerId");
  if (!partnerId) return Response.json({ error: "Missing partnerId" }, { status: 400 });

  try {
    await db.partnership.deleteMany({
      where: {
        OR: [
          { userAId: guard.userId, userBId: partnerId },
          { userAId: partnerId, userBId: guard.userId },
        ],
      },
    });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Partners DELETE failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to remove partner" }, { status: 500 });
  }
}

async function getStreak(userId: string): Promise<number> {
  const checkins = await db.checkin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
    select: { date: true },
  });
  const dates = new Set(checkins.map((c) => c.date));
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const hasToday = dates.has(todayStr);
  let streak = 0;
  for (let i = hasToday ? 0 : 1; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().split("T")[0])) streak++;
    else break;
  }
  return streak;
}

function getAvatar(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return `${Math.round(diff / 7)} weeks ago`;
}
