import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

const ICT_SETUPS = ["FVG", "iFVG", "OB", "BOS", "ChoCh", "SMT", "LiqSW", "DISP", "EQH"];

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { date, setupType, conviction, reason, hasStopLoss, linkedTradeId } = body;

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }
  if (setupType !== undefined && setupType !== null && !ICT_SETUPS.includes(setupType)) {
    return Response.json({ error: "Invalid setupType" }, { status: 400 });
  }
  if (conviction !== undefined && conviction !== null) {
    if (typeof conviction !== "number" || conviction < 1 || conviction > 10) {
      return Response.json({ error: "conviction must be 1–10" }, { status: 400 });
    }
  }

  try {
    const ritual = await db.preTradeRitual.create({
      data: {
        userId: auth.userId,
        date,
        setupType: setupType ?? null,
        conviction: conviction ?? null,
        reason: reason ? String(reason).slice(0, 500).trim() : null,
        hasStopLoss: typeof hasStopLoss === "boolean" ? hasStopLoss : false,
        linkedTradeId: linkedTradeId ?? null,
      },
    });
    return Response.json({ ok: true, ritual });
  } catch (err) {
    logger.error("PreTradeRitual POST failed", err, { userId: auth.userId });
    return Response.json({ error: "Failed to save ritual" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const rituals = await db.preTradeRitual.findMany({
      where: { userId: auth.userId, date },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ rituals });
  } catch (err) {
    logger.error("PreTradeRitual GET failed", err, { userId: auth.userId });
    return Response.json({ error: "Failed to fetch rituals" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.preTradeRitual.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { linkedTradeId } = body;

  try {
    const updated = await db.preTradeRitual.update({
      where: { id },
      data: { linkedTradeId: linkedTradeId ?? null },
    });
    return Response.json({ ok: true, ritual: updated });
  } catch (err) {
    logger.error("PreTradeRitual PATCH failed", err, { userId: auth.userId, id });
    return Response.json({ error: "Failed to update ritual" }, { status: 500 });
  }
}