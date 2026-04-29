export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true, plan: true },
  });

  if (!user?.stripeSubscriptionId) {
    return Response.json(
      { error: "No subscription found. Please manage billing at billing.stripe.com." },
      { status: 400 }
    );
  }

  if (user.plan === "free") {
    return Response.json({ error: "No active subscription" }, { status: 400 });
  }

  const stripe = new Stripe(apiKey);

  // Stripe pauses by setting pause_collection — billing stops at next period
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    pause_collection: { behavior: "keep_as_draft" },
  });

  return Response.json({ success: true });
}