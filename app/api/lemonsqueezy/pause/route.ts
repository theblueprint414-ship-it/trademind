export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lemonSqueezySetup, updateSubscription } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { lsSubscriptionId: true, plan: true },
  });

  if (!user?.lsSubscriptionId) {
    return Response.json(
      { error: "No subscription found. Please manage billing at app.lemonsqueezy.com/my-orders." },
      { status: 400 }
    );
  }

  if (user.plan === "free") {
    return Response.json({ error: "No active subscription" }, { status: 400 });
  }

  lemonSqueezySetup({ apiKey });

  const { error } = await updateSubscription(Number(user.lsSubscriptionId), {
    pause: { mode: "void" },
  });

  if (error) {
    return Response.json({ error: "Failed to pause subscription" }, { status: 500 });
  }

  return Response.json({ success: true });
}