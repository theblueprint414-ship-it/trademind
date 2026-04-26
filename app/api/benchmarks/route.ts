export const runtime = "nodejs";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// Anonymous cohort benchmarks — no personal data returned
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [allUsers, userCheckins] = await Promise.all([
    db.checkin.groupBy({
      by: ["userId"],
      _avg: { score: true },
      _count: { _all: true },
      orderBy: { _avg: { score: "desc" } },
      having: { score: { _avg: { gte: 0 } } },
      take: 2000,
    }),
    db.checkin.findMany({
      where: { userId },
      select: { score: true, verdict: true, date: true },
      orderBy: { date: "desc" },
      take: 90,
    }),
  ]);

  // Community average score per user
  const communityAvgs = allUsers
    .map((u: { _avg: { score: number | null } }) => u._avg.score ?? 0)
    .filter((s: number) => s > 0);

  if (communityAvgs.length < 3 || userCheckins.length === 0) {
    return Response.json({ insufficient: true });
  }

  communityAvgs.sort((a, b) => a - b);

  const userAvg = userCheckins.reduce((s, c) => s + c.score, 0) / userCheckins.length;

  // Percentile rank
  const below = communityAvgs.filter((s) => s < userAvg).length;
  const percentile = Math.round((below / communityAvgs.length) * 100);

  // Community median, p25, p75
  const median = communityAvgs[Math.floor(communityAvgs.length * 0.5)];
  const p25 = communityAvgs[Math.floor(communityAvgs.length * 0.25)];
  const p75 = communityAvgs[Math.floor(communityAvgs.length * 0.75)];

  // Community discipline rate (% of days they checked in vs top possible 90)
  const communityCheckinCounts = allUsers.map((u) => Math.min(u._count._all, 90));
  const avgCheckinRate = Math.round(
    (communityCheckinCounts.reduce((s, n) => s + n, 0) / communityCheckinCounts.length / 90) * 100
  );

  const userCheckinRate = Math.round(
    (userCheckins.length / 90) * 100
  );

  // GO rate community
  const allCheckins = await db.checkin.findMany({
    select: { score: true },
    take: 5000,
    orderBy: { date: "desc" },
  });
  const communityGoRate = Math.round(
    (allCheckins.filter((c) => c.score >= 70).length / allCheckins.length) * 100
  );
  const userGoRate = Math.round(
    (userCheckins.filter((c) => c.score >= 70).length / userCheckins.length) * 100
  );

  return Response.json({
    userAvg: Math.round(userAvg),
    communityAvg: Math.round(median),
    percentile,
    p25: Math.round(p25),
    p75: Math.round(p75),
    userCheckinRate,
    communityCheckinRate: avgCheckinRate,
    userGoRate,
    communityGoRate,
    totalUsers: allUsers.length,
  });
}