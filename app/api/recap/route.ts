export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const recap = await db.dailyRecap.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });

  return NextResponse.json({ recap });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, mood, pnl, playbookScore, lesson, tradesCount } = body;
  const recapDate = date ?? new Date().toISOString().split("T")[0];

  const recap = await db.dailyRecap.upsert({
    where: { userId_date: { userId: session.user.id, date: recapDate } },
    create: { userId: session.user.id, date: recapDate, mood, pnl, playbookScore, lesson, tradesCount },
    update: { mood, pnl, playbookScore, lesson, tradesCount },
  });

  return NextResponse.json({ recap });
}