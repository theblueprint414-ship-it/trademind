export const runtime = "nodejs";
export const revalidate = 3600;

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [userCount, checkinCount] = await Promise.all([
    db.user.count(),
    db.checkin.count(),
  ]);

  return NextResponse.json(
    { users: userCount, checkins: checkinCount },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}