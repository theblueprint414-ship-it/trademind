export const runtime = "nodejs";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, plan: true, publicProfile: true, createdAt: true,
        checkins: {
          select: { date: true, score: true, verdict: true },
          orderBy: { date: "desc" },
          take: 90,
        },
      },
    });

    if (!user || !user.publicProfile) return Response.json({ error: "Not found" }, { status: 404 });

    const checkins = user.checkins;
    const now = new Date();
    let streak = 0;
    for (let i = 0; i < checkins.length; i++) {
      const diff = Math.round((now.getTime() - new Date(checkins[i].date + "T12:00:00").getTime()) / 86400000);
      if (diff === i) streak++;
      else break;
    }

    let longestStreak = 0;
    let cur = 0;
    const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { cur = 1; continue; }
      const prev = new Date(sorted[i - 1].date + "T12:00:00");
      const curr = new Date(sorted[i].date + "T12:00:00");
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) cur++;
      else cur = 1;
      if (cur > longestStreak) longestStreak = cur;
    }
    if (cur > longestStreak) longestStreak = cur;

    const total = checkins.length;
    const avgScore = total > 0 ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / total) : null;
    const goDays = checkins.filter((c) => c.score >= 70).length;
    const goRate = total > 0 ? Math.round((goDays / total) * 100) : 0;
    const todayStr = now.toISOString().split("T")[0];
    const todayCheckin = checkins.find((c) => c.date === todayStr) ?? null;
    const badgeEarned = streak >= 30 || longestStreak >= 30;
    const badgeTier = streak >= 60 || longestStreak >= 60 ? "elite" : streak >= 30 || longestStreak >= 30 ? "consistent" : null;

    return Response.json({
      id: user.id, name: user.name, memberSince: user.createdAt,
      streak, longestStreak, totalCheckins: total, avgScore, goRate,
      today: todayCheckin ? { score: todayCheckin.score, verdict: todayCheckin.verdict } : null,
      recentCheckins: checkins.slice(0, 30).map((c) => ({ date: c.date, score: c.score, verdict: c.verdict })),
      badgeEarned, badgeTier,
    });
  } catch (err) {
    logger.error("Profile GET failed", err, { id });
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}