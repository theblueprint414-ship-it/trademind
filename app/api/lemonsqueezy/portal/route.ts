export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lemonSqueezySetup, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";

const FALLBACK_URL = "https://app.lemonsqueezy.com/my-orders";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { lsSubscriptionId: true },
  });

  if (!user?.lsSubscriptionId) {
    return Response.json({ url: FALLBACK_URL });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) return Response.json({ url: FALLBACK_URL });

  try {
    lemonSqueezySetup({ apiKey });
    const { data, error } = await getSubscription(Number(user.lsSubscriptionId));
    if (error || !data) return Response.json({ url: FALLBACK_URL });

    const portalUrl = data.data.attributes.urls?.customer_portal ?? FALLBACK_URL;
    return Response.json({ url: portalUrl });
  } catch {
    return Response.json({ url: FALLBACK_URL });
  }
}