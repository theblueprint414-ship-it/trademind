export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

async function resolveUserId(
  stripe: Stripe,
  customerId?: string | null,
  metadata?: Stripe.Metadata | null
): Promise<string | null> {
  // Prefer userId in metadata (set at checkout time)
  if (metadata?.userId) return metadata.userId as string;
  // Fall back to customer email lookup
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted && customer.email) {
        const user = await db.user.findUnique({ where: { email: customer.email }, select: { id: true } });
        return user?.id ?? null;
      }
    } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !apiKey) {
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "Missing stripe-signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = await resolveUserId(stripe, session.customer as string | null, session.metadata);
        if (!userId) {
          logger.error("Stripe webhook: cannot identify user", { sessionId: session.id });
          break;
        }

        await db.user.update({
          where: { id: userId },
          data: {
            plan: "premium",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripe, sub.customer as string, sub.metadata);
        if (!userId) break;

        const active = sub.status === "active" || sub.status === "trialing";
        await db.user.update({
          where: { id: userId },
          data: {
            plan: active ? "premium" : "free",
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripe, sub.customer as string, sub.metadata);
        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: { plan: "free" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.type === "subscription_details"
          ? invoice.parent.subscription_details?.subscription
          : null;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId as string);
        const userId = await resolveUserId(stripe, invoice.customer as string, sub.metadata);
        if (!userId) break;
        // Keep plan intact — Stripe retries for a grace period before marking past_due/canceled
        logger.warn("Stripe payment failed", { userId, invoiceId: invoice.id });
        break;
      }
    }
  } catch (err) {
    logger.error("Stripe webhook DB update failed", err);
    return Response.json({ error: "DB update failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}