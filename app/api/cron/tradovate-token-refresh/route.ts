export const runtime = "nodejs";
export const maxDuration = 60;

import { db } from "@/lib/db";
import { refreshTradovateToken } from "@/lib/brokers";
import { safeDecrypt, encrypt } from "@/lib/crypto";
import { NextRequest } from "next/server";

// Proactively refreshes Tradovate access tokens for all active connections.
// Runs every 12 hours so tokens never expire mid-session.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db.brokerConnection.findMany({
    where: { broker: "tradovate", status: "active" },
    select: { id: true, apiKey: true, environment: true },
  });

  let refreshed = 0;
  let failed = 0;

  for (const conn of connections) {
    const result = await refreshTradovateToken(safeDecrypt(conn.apiKey), conn.environment);

    if (result.ok && result.newToken) {
      await db.brokerConnection.update({
        where: { id: conn.id },
        data: { apiKey: encrypt(result.newToken), status: "active" },
      });
      refreshed++;
    } else {
      await db.brokerConnection.update({
        where: { id: conn.id },
        data: { status: "error" },
      });
      failed++;
    }
  }

  return Response.json({ ok: true, refreshed, failed, total: connections.length });
}
