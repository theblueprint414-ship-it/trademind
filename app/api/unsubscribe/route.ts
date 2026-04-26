export const runtime = "nodejs";

import { db } from "@/lib/db";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

function makeToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "")
    .update(email)
    .digest("hex");
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  if (token !== makeToken(email)) {
    return Response.json({ error: "Invalid token" }, { status: 403 });
  }

  await db.user.updateMany({
    where: { email },
    data: { emailReminders: false },
  });

  return Response.json({ ok: true });
}