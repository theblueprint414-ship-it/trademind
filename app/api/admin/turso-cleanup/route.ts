import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time: drops tables removed from schema (Partnership, PartnerInvite, BridgeToken, Circle, CircleMember)
// Run once after deploy: POST /api/admin/turso-cleanup with x-admin-secret header
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  const tables = ["CircleMember", "Circle", "PartnerInvite", "Partnership", "BridgeToken"];

  for (const table of tables) {
    try {
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
      results[table] = "dropped";
    } catch (err) {
      results[table] = `error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // Backfill source field: edgebridge → broker
  try {
    const updated = await db.tradeEntry.updateMany({
      where: { source: "edgebridge" },
      data: { source: "broker" },
    });
    results["backfill_source"] = `updated ${updated.count} rows`;
  } catch (err) {
    results["backfill_source"] = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({ ok: true, results });
}
