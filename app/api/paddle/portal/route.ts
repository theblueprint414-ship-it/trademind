export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    return Response.json({ url: "https://customer.paddle.com" });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { paddleCustomerId: true, paddleSubscriptionId: true },
  });

  if (!user?.paddleCustomerId) {
    return Response.json({ url: "https://customer.paddle.com" });
  }

  try {
    const paddle = new Paddle(apiKey, {
      environment: process.env.PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox,
    });

    const subs = user.paddleSubscriptionId ? [user.paddleSubscriptionId] : [];
    const portalSession = await paddle.customerPortalSessions.create(user.paddleCustomerId, subs);

    return Response.json({ url: portalSession.urls.general.overview });
  } catch {
    return Response.json({ url: "https://customer.paddle.com" });
  }
}