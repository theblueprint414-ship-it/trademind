import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// Returns config needed by the frontend to open Paddle Overlay Checkout
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientToken = process.env.PADDLE_CLIENT_TOKEN;
  const priceId = process.env.PADDLE_PRO_PRICE_ID;
  const environment = process.env.PADDLE_ENVIRONMENT ?? "sandbox";

  if (!process.env.PADDLE_ENVIRONMENT) {
    console.warn("PADDLE_ENVIRONMENT is not set — defaulting to sandbox. Set to 'production' for live payments.");
  }

  if (!clientToken || !priceId) {
    return Response.json({ error: "Paddle not configured" }, { status: 500 });
  }

  return Response.json({
    clientToken,
    priceId,
    environment,
    userId: session.user.id,
    email: session.user.email ?? undefined,
  });
}
