export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return Response.json({ url: "https://billing.stripe.com" });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return Response.json({ url: "https://billing.stripe.com" });
  }

  const origin = req.headers.get("origin") ?? "https://trademindedge.com";

  try {
    const stripe = new Stripe(apiKey);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/settings`,
    });
    return Response.json({ url: portalSession.url });
  } catch {
    return Response.json({ url: "https://billing.stripe.com" });
  }
}