import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time: rename source="edgebridge" → "broker" for all TradeEntry rows
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.tradeEntry.updateMany({
    where: { source: "edgebridge" },
    data: { source: "broker" },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
