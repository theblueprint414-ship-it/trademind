export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { paddleSubscriptionId: true, plan: true },
  });

  if (!user?.paddleSubscriptionId) {
    return Response.json({ error: "No subscription found. Please manage billing at customer.paddle.com." }, { status: 400 });
  }

  if (user.plan === "free") {
    return Response.json({ error: "No active subscription" }, { status: 400 });
  }

  const paddle = new Paddle(apiKey, {
    environment: process.env.PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox,
  });

  await paddle.subscriptions.pause(user.paddleSubscriptionId, {
    effectiveFrom: "next_billing_period",
  });

  return Response.json({ success: true });
}