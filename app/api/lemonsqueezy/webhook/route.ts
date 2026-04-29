export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

type LSSubscription = {
  id: string;
  attributes: {
    status: string;
    customer_id: number;
    variant_id: number;
    user_email: string;
    customer_portal: string;
    first_subscription_item: {
      subscription_id: number;
    };
    urls: {
      customer_portal: string;
    };
  };
};

type LSWebhookPayload = {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: LSSubscription;
};

async function resolveUserId(customData?: { user_id?: string }, email?: string): Promise<string | null> {
  if (customData?.user_id) return customData.user_id;
  if (email) {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    return user?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const sig = req.headers.get("x-signature");
  if (!sig) {
    return Response.json({ error: "Missing x-signature header" }, { status: 400 });
  }

  const body = await req.text();
  const hash = createHmac("sha256", secret).update(body).digest("hex");
  if (hash !== sig) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LSWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_name, custom_data } = payload.meta;
  const sub = payload.data;
  const lsSubscriptionId = String(sub.id);
  const lsCustomerId = String(sub.attributes.customer_id);
  const email = sub.attributes.user_email;

  try {
    switch (event_name) {
      case "subscription_created":
      case "subscription_resumed":
      case "subscription_unpaused": {
        const userId = await resolveUserId(custom_data, email);
        if (!userId) {
          logger.error("LS webhook: cannot identify user", { event_name, email });
          break;
        }
        await db.user.update({
          where: { id: userId },
          data: { plan: "premium", lsSubscriptionId, lsCustomerId },
        });
        break;
      }

      case "subscription_updated": {
        const userId = await resolveUserId(custom_data, email);
        if (!userId) break;
        const active = ["active", "trialing", "past_due"].includes(sub.attributes.status);
        await db.user.update({
          where: { id: userId },
          data: {
            plan: active ? "premium" : "free",
            lsSubscriptionId,
            lsCustomerId,
          },
        });
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused": {
        const userId = await resolveUserId(custom_data, email);
        if (!userId) break;
        await db.user.update({
          where: { id: userId },
          data: { plan: "free" },
        });
        break;
      }
    }
  } catch (err) {
    logger.error("LS webhook DB update failed", err);
    return Response.json({ error: "DB update failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}