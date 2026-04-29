export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

function setup() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY not configured");
  lemonSqueezySetup({ apiKey });
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!storeId || !variantId) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  try {
    setup();
  } catch {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? "https://trademindedge.com";

  const { data, error } = await createCheckout(Number(storeId), Number(variantId), {
    checkoutData: {
      email: session.user.email,
      custom: { user_id: session.user.id },
    },
    productOptions: {
      redirectUrl: `${origin}/dashboard?upgraded=true`,
      receiptButtonText: "Go to Dashboard",
      receiptThankYouNote: "Welcome to TradeMind. Your edge starts now.",
      enabledVariants: [Number(variantId)],
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    expiresAt: null,
    preview: false,
  });

  if (error || !data?.data.attributes.url) {
    return Response.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  return Response.json({ url: data.data.attributes.url });
}