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

  const conns = await db.brokerConnection.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (conns.length === 0) return Response.json({ error: "No broker connected" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];
  let totalTrades = 0;
  let lastDailyPnl: number | null = null;

  for (const conn of conns) {
    const brokerConfig = {
      broker: conn.broker,
      apiKey: safeDecrypt(conn.apiKey),
      apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
      environment: conn.environment,
    };

    let tradesCount: number | null = null;

    if (conn.broker === "topstepx") {
      const data = await fetchTopstepXDailyData(brokerConfig);
      if (data === null) {
        await db.brokerConnection.update({ where: { id: conn.id }, data: { status: "error" } });
        continue;
      }
      tradesCount = data.count;
      lastDailyPnl = data.pnl;
    } else {
      tradesCount = await fetchTodayTrades(brokerConfig);
      if (tradesCount === null) {
        await db.brokerConnection.update({ where: { id: conn.id }, data: { status: "error" } });
        continue;
      }
    }

    totalTrades += tradesCount;
    await db.brokerConnection.update({ where: { id: conn.id }, data: { lastSyncAt: new Date(), status: "active" } });
  }

  await db.trade.deleteMany({ where: { userId, date: today } });
  if (totalTrades > 0) {
    await db.trade.createMany({
      data: Array.from({ length: totalTrades }).map(() => ({ userId, date: today })),
    });
  }

  return Response.json({ ok: true, trades: totalTrades, dailyPnl: lastDailyPnl });
}
