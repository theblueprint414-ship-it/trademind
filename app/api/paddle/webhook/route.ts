import { Paddle, Environment, EventName } from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

type SubData = {
  customData?: { userId?: string };
  customerEmail?: string;
  status?: string;
  items?: { price?: { id?: string } }[];
};

// Price ID is the ONLY authoritative source — never trust client-supplied customData for plan
function resolvePlanFromPriceId(data: SubData): "pro" | "premium" {
  const itemPriceId = data.items?.[0]?.price?.id;
  if (!itemPriceId) return "pro";
  const premiumIds = [
    process.env.PADDLE_PREMIUM_PRICE_ID,
    process.env.PADDLE_PREMIUM_ANNUAL_PRICE_ID,
  ].filter(Boolean);
  if (premiumIds.includes(itemPriceId)) return "premium";
  return "pro";
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const apiKey = process.env.PADDLE_API_KEY;

  if (!webhookSecret || !apiKey) {
    return Response.json({ error: "Paddle not configured" }, { status: 500 });
  }

  const paddle = new Paddle(apiKey, {
    environment: process.env.PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox,
  });

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!signature) {
    return Response.json({ error: "Missing paddle-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionActivated: {
        const sub = event.data as SubData;
        const plan = resolvePlanFromPriceId(sub);
        const userId = sub.customData?.userId;
        if (userId) {
          await db.user.update({ where: { id: userId }, data: { plan } });
        } else if (sub.customerEmail) {
          await db.user.update({ where: { email: sub.customerEmail }, data: { plan } });
        } else {
          console.error("Paddle webhook: cannot identify user — no userId or email", { eventType: event.eventType });
          return Response.json({ error: "Cannot identify user" }, { status: 400 });
        }
        break;
      }

      case EventName.SubscriptionUpdated: {
        const sub = event.data as SubData;
        const plan = resolvePlanFromPriceId(sub);
        const userId = sub.customData?.userId;
        if (userId) {
          await db.user.update({ where: { id: userId }, data: { plan } });
        } else if (sub.customerEmail) {
          await db.user.update({ where: { email: sub.customerEmail }, data: { plan } });
        } else {
          console.error("Paddle webhook: cannot identify user for update", { eventType: event.eventType });
          return Response.json({ error: "Cannot identify user" }, { status: 400 });
        }
        break;
      }

      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPastDue: {
        const sub = event.data as SubData;
        const userId = sub.customData?.userId;
        if (userId) {
          await db.user.update({ where: { id: userId }, data: { plan: "free" } });
        } else if (sub.customerEmail) {
          await db.user.update({ where: { email: sub.customerEmail }, data: { plan: "free" } });
        } else {
          console.error("Paddle webhook: cannot identify user for cancellation", { eventType: event.eventType });
        }
        break;
      }

      case EventName.TransactionCompleted: {
        const tx = event.data as SubData;
        const plan = resolvePlanFromPriceId(tx);
        const userId = tx.customData?.userId;
        if (userId) {
          await db.user.update({ where: { id: userId }, data: { plan } });
        } else if (tx.customerEmail) {
          await db.user.update({ where: { email: tx.customerEmail }, data: { plan } });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook DB update failed:", err);
    return Response.json({ error: "DB update failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}