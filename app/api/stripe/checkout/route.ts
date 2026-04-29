export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import Stripe from "stripe";

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  let s: Stripe;
  try {
    s = stripe();
  } catch {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? "https://trademindedge.com";

  const checkoutSession = await s.checkout.sessions.create({
    mode: "subscription",
    customer: user?.stripeCustomerId ?? undefined,
    customer_email: user?.stripeCustomerId ? undefined : session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: session.user.id },
    },
    metadata: { userId: session.user.id },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/settings`,
  });

  return Response.json({ url: checkoutSession.url });
}