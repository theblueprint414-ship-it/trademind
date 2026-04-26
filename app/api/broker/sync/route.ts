import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fetchTodayTrades, fetchTopstepXDailyData } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const conn = await db.brokerConnection.findUnique({ where: { userId } });
  if (!conn) return Response.json({ error: "No broker connected" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];
  const brokerConfig = {
    broker: conn.broker,
    apiKey: safeDecrypt(conn.apiKey),
    apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
    environment: conn.environment,
  };

  let tradesCount: number | null = null;
  let dailyPnl: number | null = null;

  if (conn.broker === "topstepx") {
    const data = await fetchTopstepXDailyData(brokerConfig);
    if (data === null) {
      await db.brokerConnection.update({ where: { userId }, data: { status: "error" } });
      return Response.json({ error: "Sync failed" }, { status: 502 });
    }
    tradesCount = data.count;
    dailyPnl = data.pnl;
  } else {
    tradesCount = await fetchTodayTrades(brokerConfig);
    if (tradesCount === null) {
      await db.brokerConnection.update({ where: { userId }, data: { status: "error" } });
      return Response.json({ error: "Sync failed" }, { status: 502 });
    }
  }

  await db.trade.deleteMany({ where: { userId, date: today } });
  if (tradesCount > 0) {
    await db.trade.createMany({
      data: Array.from({ length: tradesCount }).map(() => ({ userId, date: today })),
    });
  }
  await db.brokerConnection.update({ where: { userId }, data: { lastSyncAt: new Date(), status: "active" } });

  return Response.json({ ok: true, trades: tradesCount, dailyPnl });
}
