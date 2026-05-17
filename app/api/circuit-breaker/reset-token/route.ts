import { rateLimit } from "@/lib/ratelimit";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse , NextRequest} from "next/server";
import { randomUUID } from "crypto";

// POST — regenerate extension token
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const extensionToken = randomUUID();

  const cb = await db.circuitBreaker.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, extensionToken },
    update: { extensionToken },
  });

  return NextResponse.json({ extensionToken: cb.extensionToken });
}