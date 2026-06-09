import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { refreshTradovateToken } from "@/lib/brokers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conns = await db.brokerConnection.findMany({
    where: { userId: session.user.id, broker: "tradovate" },
  });
  if (conns.length === 0) {
    return Response.json({ error: "No Tradovate connection found" }, { status: 404 });
  }

  let anyOk = false;
  for (const conn of conns) {
    const result = await refreshTradovateToken(safeDecrypt(conn.apiKey), conn.environment);
    if (!result.ok || !result.newToken) {
      await db.brokerConnection.update({ where: { id: conn.id }, data: { status: "error" } });
    } else {
      await db.brokerConnection.update({
        where: { id: conn.id },
        data: { apiKey: encrypt(result.newToken), status: "active" },
      });
      anyOk = true;
    }
  }

  if (!anyOk) {
    return Response.json({ error: "Session expired — please reconnect your Tradovate account." }, { status: 401 });
  }

  return Response.json({ ok: true });
}
