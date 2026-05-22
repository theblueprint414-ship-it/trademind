import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const tradovateBase = (env: string) =>
  env === "paper" ? "https://demo.tradovateapi.com/v1" : "https://live.tradovateapi.com/v1";

// POST — renew an expiring Tradovate access token using the current Bearer token.
// Tradovate tokens expire; call this before they go stale.
// Returns { ok: true } on success or { error } on failure (client should reconnect).
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await db.brokerConnection.findUnique({ where: { userId: session.user.id } });
  if (!conn || conn.broker !== "tradovate") {
    return Response.json({ error: "No Tradovate connection found" }, { status: 404 });
  }

  const token = safeDecrypt(conn.apiKey);

  const res = await fetch(`${tradovateBase(conn.environment)}/auth/renewaccesstoken`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!res?.ok) {
    // Token is expired or the account was revoked — mark as error so UI prompts reconnect
    await db.brokerConnection.update({ where: { userId: session.user.id }, data: { status: "error" } });
    const data = await res?.json().catch(() => ({})) ?? {};
    return Response.json({ error: data.errorText ?? "Session expired — please reconnect your Tradovate account." }, { status: 401 });
  }

  const data = await res.json().catch(() => null);
  if (!data?.accessToken) {
    return Response.json({ error: "Renewal response missing token" }, { status: 502 });
  }

  await db.brokerConnection.update({
    where: { userId: session.user.id },
    data: { apiKey: encrypt(data.accessToken), status: "active" },
  });

  return Response.json({ ok: true });
}