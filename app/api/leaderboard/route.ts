import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

function consistencyScore(streak: number, checkins30: number, avgScore30: number): number {
  const streakPts = Math.min(streak, 30) * 15;
  const consistencyPts = (checkins30 / 30) * 240;
  const qualityPts = (avgScore30 / 100) * 150;
  return Math.round(streakPts + consistencyPts + qualityPts);
}

function displayName(name: string | null, id: string): string {
  if (!name) return `Trader#${id.slice(-4).toUpperCase()}`;
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export async function GET() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const session = await auth();

  const users = await db.user.findMany({
    where: { publicProfile: true },
    select: {
      id: true,
      name: true,
      checkins: {
        where: { date: { gte: thirtyDaysAgoStr } },
        orderBy: { date: "desc" },
        select: { date: true, score: true, verdict: true },
      },
    },
    take: 500,
  });

  const entries = users
    .map((user) => {
      const checkins = user.checkins;
      if (checkins.length === 0) return null;

      // Current streak
      let streak = 0;
      for (let i = 0; i < 31; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split("T")[0];
        if (checkins.some((c) => c.date === dStr)) streak++;
        else break;
      }

      const avgScore = checkins.length
        ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length)
        : 0;

      const score = consistencyScore(streak, checkins.length, avgScore);
      const checkedInToday = checkins.some((c) => c.date === todayStr);
      const goDays = checkins.filter((c) => c.verdict === "GO").length;
      const noTradeDays = checkins.filter((c) => c.verdict === "NO-TRADE").length;

      return {
        id: user.id,
        name: displayName(user.name, user.id),
        score,
        streak,
        checkins30: checkins.length,
        avgScore,
        checkedInToday,
        goDays,
        noTradeDays,
        isCurrentUser: session?.user?.id === user.id,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 100);

  // If logged-in user has publicProfile=false, append their entry at bottom
  let currentUserEntry = null;
  if (session?.user?.id && !entries.some((e) => e?.isCurrentUser)) {
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        publicProfile: true,
        checkins: {
          where: { date: { gte: thirtyDaysAgoStr } },
          orderBy: { date: "desc" },
          select: { date: true, score: true, verdict: true },
        },
      },
    });
    if (me && me.checkins.length > 0) {
      let streak = 0;
      for (let i = 0; i < 31; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split("T")[0];
        if (me.checkins.some((c) => c.date === dStr)) streak++;
        else break;
      }
      const avgScore = Math.round(me.checkins.reduce((s, c) => s + c.score, 0) / me.checkins.length);
      currentUserEntry = {
        id: me.id,
        name: "You (private)",
        score: consistencyScore(streak, me.checkins.length, avgScore),
        streak,
        checkins30: me.checkins.length,
        avgScore,
        checkedInToday: me.checkins.some((c) => c.date === todayStr),
        goDays: me.checkins.filter((c) => c.verdict === "GO").length,
        noTradeDays: me.checkins.filter((c) => c.verdict === "NO-TRADE").length,
        isCurrentUser: true,
        isPrivate: true,
      };
    }
  }

  return NextResponse.json({ entries, currentUserEntry });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { publicProfile: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.user.update({
    where: { id: session.user.id },
    data: { publicProfile: !user.publicProfile },
  });

  return NextResponse.json({ publicProfile: !user.publicProfile });
}