import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

function checkSecret(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  const secret = process.env.CRON_SECRET ?? "";
  if (!token || !secret) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

const CRON_ROUTES: Record<string, string> = {
  "reminder": "/api/cron/reminder",
  "weekly-digest": "/api/cron/weekly-digest",
  "circuit-breaker-reset": "/api/cron/circuit-breaker-reset",
  "streak-recovery": "/api/cron/streak-recovery",
  "behavioral-triggers": "/api/cron/behavioral-triggers",
  "mid-session-push": "/api/cron/mid-session-push",
  "onboarding-emails": "/api/cron/onboarding-emails",
  "auto-sync-journal": "/api/cron/auto-sync-journal",
};

export async function POST(req: NextRequest) {
  if (!checkSecret(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { agent } = await req.json().catch(() => ({})) as { agent?: string };
  if (!agent || !CRON_ROUTES[agent]) {
    return Response.json({ error: "Unknown agent", available: Object.keys(CRON_ROUTES) }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trademindedge.com";
  const url = `${appUrl}${CRON_ROUTES[agent]}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const data = await res.json().catch(() => ({}));
    return Response.json({ ok: res.ok, status: res.status, data });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 502 });
  }
}
