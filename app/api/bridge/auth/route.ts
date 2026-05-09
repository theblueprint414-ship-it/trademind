// EdgeBridge token management — create, list, revoke tokens
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

const MAX_TOKENS_PER_USER = 5;

// POST — create a new bridge token for the authenticated user
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));
  const { deviceName, platform } = body;

  // Enforce token cap
  const count = await db.bridgeToken.count({ where: { userId: auth.userId } });
  if (count >= MAX_TOKENS_PER_USER) {
    return Response.json({ error: "Maximum tokens reached. Revoke an existing token first." }, { status: 409 });
  }

  try {
    const token = await db.bridgeToken.create({
      data: {
        userId: auth.userId,
        token: randomUUID(),
        deviceName: deviceName ? String(deviceName).slice(0, 60) : null,
        platform: ["windows", "mac", "linux"].includes(platform) ? platform : null,
      },
    });

    return Response.json({
      ok: true,
      id: token.id,
      token: token.token,
      deviceName: token.deviceName,
      platform: token.platform,
      createdAt: token.createdAt,
    });
  } catch (err) {
    logger.error("Bridge token create failed", err, { userId: auth.userId });
    return Response.json({ error: "Failed to create token" }, { status: 500 });
  }
}

// GET — list tokens (masked) for the authenticated user
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "loose");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const tokens = await db.bridgeToken.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, deviceName: true, platform: true, brokers: true,
        lastUsedAt: true, createdAt: true,
        // Mask token — show last 8 chars only
        token: true,
      },
    });

    return Response.json({
      tokens: tokens.map((t) => ({
        ...t,
        token: "••••••••-••••-••••-••••-" + t.token.slice(-8),
      })),
    });
  } catch (err) {
    logger.error("Bridge token list failed", err, { userId: auth.userId });
    return Response.json({ error: "Failed to list tokens" }, { status: 500 });
  }
}

// DELETE — revoke a token by id
export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.bridgeToken.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await db.bridgeToken.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Bridge token delete failed", err, { userId: auth.userId, id });
    return Response.json({ error: "Failed to revoke token" }, { status: 500 });
  }
}