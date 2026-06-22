import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

const MAX_TEXT = 1000;
const MAX_PNL = 1_000_000;
const MAX_TAGS = 5;
const MAX_TAG_LEN = 30;
const FREE_DAILY_LIMIT = 3;

function computeGrade(opts: {
  setup?: string | null;
  reflection?: string | null;
  playbookScore?: number | null;
  riskAmount?: number | null;
  stopLoss?: number | null;
  pnl?: number | null;
}): string {
  let pts = 0;
  if (opts.setup) pts++;
  if (opts.reflection) pts++;
  if (opts.playbookScore === 2) pts++;
  if (opts.riskAmount || opts.stopLoss) pts++;
  if (pts >= 4) return "A";
  if (pts === 3) return "B";
  if (pts === 2) return "C";
  return "D";
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { plan: true } });
  const isPro = user?.plan === "pro" || user?.plan === "premium";

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);

  // Free users: only last 7 days
  const where = date && date !== "all"
    ? { userId: auth.userId, date }
    : isPro
      ? { userId: auth.userId }
      : { userId: auth.userId, date: { gte: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] } };

  try {
    const entries = await db.tradeEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return Response.json({ entries, plan: user?.plan ?? "free" });
  } catch (err) {
    logger.error("Journal GET failed", err, { userId: auth.userId });
    return Response.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { plan: true } });
  const isPro = user?.plan === "pro" || user?.plan === "premium";

  const today = new Date().toISOString().split("T")[0];

  // Free users: max 3 trades/day
  if (!isPro) {
    const todayCount = await db.tradeEntry.count({ where: { userId: auth.userId, date: today } });
    if (todayCount >= FREE_DAILY_LIMIT) {
      return Response.json({ error: "Free plan limit: 3 trades/day. Upgrade to TradeMind for unlimited journaling.", limitReached: true }, { status: 403 });
    }
  }

  // Shim guard for downstream code
  const guard = { userId: auth.userId };

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { date, symbol, side, pnl, setup, emotionBefore, emotionAfter, mistake, notes, checkinScore, tags, ictSetups, reflection, chartUrl,
    stopLoss, takeProfit, riskAmount, commission, assetType, plannedEntry, mae, mfe,
    optionType, strikePrice, expiryDate, multiplier, tradingAccountId,
    confidence, marketCondition, timeframe, sessionType, lotSize, pips, swap, screenshotUrls } = body;

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  // ── Circuit Breaker enforcement ───────────────────────────────────────────
  // Mirrors /api/circuit-breaker/status (used by the Chrome extension / MT4 EA)
  // exactly, including the resetHour-anchored rolling window — otherwise a
  // custom reset hour (e.g. 18:00 UTC for futures traders) would be respected
  // by the extension but silently ignored by the web journal.
  const cbSettings = await db.circuitBreaker.findUnique({ where: { userId: auth.userId } });
  if (cbSettings?.isActive) {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setUTCHours(cbSettings.resetHour, 0, 0, 0);
    if (now.getUTCHours() < cbSettings.resetHour) {
      windowStart.setUTCDate(windowStart.getUTCDate() - 1);
    }

    const tradeCount = await db.tradeEntry.count({ where: { userId: auth.userId, createdAt: { gte: windowStart } } });
    let effectiveLimit = cbSettings.dailyLimit;

    if (cbSettings.scoreAdaptive) {
      const checkin = await db.checkin.findUnique({
        where: { userId_date: { userId: auth.userId, date: today } },
        select: { verdict: true },
      });
      if (checkin?.verdict === "NO-TRADE") effectiveLimit = 0;
      else if (checkin?.verdict === "CAUTION") effectiveLimit = Math.ceil(cbSettings.dailyLimit * 0.5);
      else if (!checkin) effectiveLimit = Math.ceil(cbSettings.dailyLimit * 0.75);
    }

    if (tradeCount >= effectiveLimit) {
      return Response.json({
        error: effectiveLimit === 0
          ? "Circuit breaker: your mental score is NO-TRADE today. No trades can be logged."
          : `Circuit breaker: daily limit of ${effectiveLimit} trade${effectiveLimit === 1 ? "" : "s"} reached (${tradeCount} logged today). Resets at ${String(cbSettings.resetHour).padStart(2, "0")}:00 UTC.`,
        circuitBreaker: true,
        blocked: true,
        tradeCount,
        effectiveLimit,
        dailyLimit: cbSettings.dailyLimit,
      }, { status: 429 });
    }
  }
  if (side && !["long", "short"].includes(side)) {
    return Response.json({ error: "Invalid side" }, { status: 400 });
  }
  if (pnl !== undefined && pnl !== null) {
    if (typeof pnl !== "number" || !isFinite(pnl) || Math.abs(pnl) > MAX_PNL) {
      return Response.json({ error: "Invalid pnl" }, { status: 400 });
    }
  }
  if (emotionBefore !== undefined && emotionBefore !== null && (emotionBefore < 1 || emotionBefore > 5)) {
    return Response.json({ error: "emotionBefore must be 1–5" }, { status: 400 });
  }
  if (emotionAfter !== undefined && emotionAfter !== null && (emotionAfter < 1 || emotionAfter > 5)) {
    return Response.json({ error: "emotionAfter must be 1–5" }, { status: 400 });
  }

  let tagsJson: string | null = null;
  if (tags !== undefined && tags !== null) {
    const arr = Array.isArray(tags) ? tags : [];
    const filtered = arr.slice(0, MAX_TAGS).map((t: unknown) => String(t).slice(0, MAX_TAG_LEN));
    tagsJson = JSON.stringify(filtered);
  }

  let ictSetupsJson: string | null = null;
  if (ictSetups !== undefined && ictSetups !== null) {
    const arr = Array.isArray(ictSetups) ? ictSetups : [];
    ictSetupsJson = JSON.stringify(arr.slice(0, 10).map((t: unknown) => String(t).slice(0, 20)));
  }

  try {
    const parsedRiskAmount = typeof riskAmount === "number" && isFinite(riskAmount) ? riskAmount : null;
    const parsedPnlNum = typeof pnl === "number" && isFinite(pnl) ? pnl : null;
    const autoRMultiple = parsedRiskAmount && parsedRiskAmount > 0 && parsedPnlNum !== null
      ? Math.round((parsedPnlNum / parsedRiskAmount) * 100) / 100 : null;

    const ASSET_TYPES = ["futures", "forex", "crypto", "stocks", "options"];

    const entry = await db.tradeEntry.create({
      data: {
        userId: guard.userId,
        date,
        symbol: symbol ? String(symbol).slice(0, 20).trim() : null,
        side: side || null,
        pnl: pnl ?? null,
        setup: setup ? String(setup).slice(0, MAX_TEXT).trim() : null,
        emotionBefore: emotionBefore ?? null,
        emotionAfter: emotionAfter ?? null,
        mistake: mistake ? String(mistake).slice(0, MAX_TEXT).trim() : null,
        notes: notes ? String(notes).slice(0, MAX_TEXT).trim() : null,
        checkinScore: checkinScore ?? null,
        tags: tagsJson,
        ictSetups: ictSetupsJson,
        reflection: reflection ? String(reflection).slice(0, MAX_TEXT).trim() : null,
        chartUrl: typeof chartUrl === "string" && chartUrl.startsWith("https://") ? chartUrl : null,
        stopLoss: typeof stopLoss === "number" && isFinite(stopLoss) ? stopLoss : null,
        takeProfit: typeof takeProfit === "number" && isFinite(takeProfit) ? takeProfit : null,
        riskAmount: parsedRiskAmount,
        rMultiple: autoRMultiple,
        commission: typeof commission === "number" && isFinite(commission) ? commission : null,
        assetType: typeof assetType === "string" && ASSET_TYPES.includes(assetType) ? assetType : null,
        plannedEntry: typeof plannedEntry === "number" && isFinite(plannedEntry) ? plannedEntry : null,
        mae: typeof mae === "number" && isFinite(mae) ? mae : null,
        mfe: typeof mfe === "number" && isFinite(mfe) ? mfe : null,
        optionType: typeof optionType === "string" && ["call", "put"].includes(optionType) ? optionType : null,
        strikePrice: typeof strikePrice === "number" && isFinite(strikePrice) ? strikePrice : null,
        expiryDate: typeof expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiryDate) ? expiryDate : null,
        multiplier: typeof multiplier === "number" && isFinite(multiplier) && multiplier > 0 ? multiplier : null,
        tradingAccountId: typeof tradingAccountId === "string" && tradingAccountId ? tradingAccountId : null,
        confidence: typeof confidence === "number" && confidence >= 1 && confidence <= 10 ? Math.round(confidence) : null,
        marketCondition: typeof marketCondition === "string" && ["trending","ranging","breakout","reversal"].includes(marketCondition) ? marketCondition : null,
        timeframe: typeof timeframe === "string" && timeframe.trim() ? timeframe.trim().slice(0, 10) : null,
        sessionType: typeof sessionType === "string" && ["asian","london","new_york","overlap_london_ny"].includes(sessionType) ? sessionType : null,
        lotSize: typeof lotSize === "number" && isFinite(lotSize) && lotSize > 0 ? lotSize : null,
        pips: typeof pips === "number" && isFinite(pips) ? pips : null,
        swap: typeof swap === "number" && isFinite(swap) ? swap : null,
        screenshotUrls: Array.isArray(screenshotUrls) && screenshotUrls.length > 0 ? JSON.stringify(screenshotUrls.slice(0, 5)) : (typeof screenshotUrls === "string" ? screenshotUrls : null),
        grade: computeGrade({ setup, reflection, riskAmount: parsedRiskAmount, stopLoss: typeof stopLoss === "number" ? stopLoss : null, pnl: parsedPnlNum }),
      },
    });
    return Response.json({ ok: true, entry });
  } catch (err) {
    logger.error("Journal POST failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to save trade" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  // Editing your own entries is free — only live broker sync/import is paid.
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.tradeEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { symbol, side, pnl, setup, emotionBefore, emotionAfter, mistake, notes, tags, ictSetups: ictSetupsPatch, reflection, chartUrl,
    stopLoss, takeProfit, riskAmount, commission, assetType, plannedEntry, mae, mfe,
    optionType: optionTypePatch, strikePrice: strikePricePatch, expiryDate: expiryDatePatch, multiplier: multiplierPatch, tradingAccountId: tradingAccountIdPatch,
    confidence: confidencePatch, marketCondition: marketConditionPatch, timeframe: timeframePatch, sessionType: sessionTypePatch,
    lotSize: lotSizePatch, pips: pipsPatch, swap: swapPatch, screenshotUrls: screenshotUrlsPatch } = body;
  const ASSET_TYPES_PATCH = ["futures", "forex", "crypto", "stocks", "options"];

  if (side !== undefined && side !== null && !["long", "short"].includes(side)) {
    return Response.json({ error: "Invalid side" }, { status: 400 });
  }
  if (pnl !== undefined && pnl !== null) {
    if (typeof pnl !== "number" || !isFinite(pnl) || Math.abs(pnl) > MAX_PNL) {
      return Response.json({ error: "Invalid pnl" }, { status: 400 });
    }
  }
  if (emotionBefore !== undefined && emotionBefore !== null && (emotionBefore < 1 || emotionBefore > 5)) {
    return Response.json({ error: "emotionBefore must be 1–5" }, { status: 400 });
  }
  if (emotionAfter !== undefined && emotionAfter !== null && (emotionAfter < 1 || emotionAfter > 5)) {
    return Response.json({ error: "emotionAfter must be 1–5" }, { status: 400 });
  }

  let tagsJson: string | null | undefined = undefined;
  if (tags !== undefined) {
    if (tags === null) {
      tagsJson = null;
    } else {
      const arr = Array.isArray(tags) ? tags : [];
      const filtered = arr.slice(0, MAX_TAGS).map((t: unknown) => String(t).slice(0, MAX_TAG_LEN));
      tagsJson = JSON.stringify(filtered);
    }
  }

  let ictSetupsJsonPatch: string | null | undefined = undefined;
  if (ictSetupsPatch !== undefined) {
    if (ictSetupsPatch === null) {
      ictSetupsJsonPatch = null;
    } else {
      const arr = Array.isArray(ictSetupsPatch) ? ictSetupsPatch : [];
      ictSetupsJsonPatch = JSON.stringify(arr.slice(0, 10).map((t: unknown) => String(t).slice(0, 20)));
    }
  }

  const updateData: Record<string, unknown> = {};
  if (symbol !== undefined) updateData.symbol = symbol ? String(symbol).slice(0, 20).trim() : null;
  if (side !== undefined) updateData.side = side || null;
  if (pnl !== undefined) updateData.pnl = pnl ?? null;
  if (setup !== undefined) updateData.setup = setup ? String(setup).slice(0, MAX_TEXT).trim() : null;
  if (emotionBefore !== undefined) updateData.emotionBefore = emotionBefore ?? null;
  if (emotionAfter !== undefined) updateData.emotionAfter = emotionAfter ?? null;
  if (mistake !== undefined) updateData.mistake = mistake ? String(mistake).slice(0, MAX_TEXT).trim() : null;
  if (notes !== undefined) updateData.notes = notes ? String(notes).slice(0, MAX_TEXT).trim() : null;
  if (tagsJson !== undefined) updateData.tags = tagsJson;
  if (ictSetupsJsonPatch !== undefined) updateData.ictSetups = ictSetupsJsonPatch;
  if (reflection !== undefined) updateData.reflection = reflection ? String(reflection).slice(0, MAX_TEXT).trim() : null;
  if (chartUrl !== undefined) updateData.chartUrl = typeof chartUrl === "string" && chartUrl.startsWith("https://") ? chartUrl : null;
  if (stopLoss !== undefined) updateData.stopLoss = typeof stopLoss === "number" && isFinite(stopLoss) ? stopLoss : null;
  if (takeProfit !== undefined) updateData.takeProfit = typeof takeProfit === "number" && isFinite(takeProfit) ? takeProfit : null;
  if (commission !== undefined) updateData.commission = typeof commission === "number" && isFinite(commission) ? commission : null;
  if (assetType !== undefined) updateData.assetType = typeof assetType === "string" && ASSET_TYPES_PATCH.includes(assetType) ? assetType : null;
  if (plannedEntry !== undefined) updateData.plannedEntry = typeof plannedEntry === "number" && isFinite(plannedEntry) ? plannedEntry : null;
  if (mae !== undefined) updateData.mae = typeof mae === "number" && isFinite(mae) ? mae : null;
  if (mfe !== undefined) updateData.mfe = typeof mfe === "number" && isFinite(mfe) ? mfe : null;
  if (optionTypePatch !== undefined) updateData.optionType = typeof optionTypePatch === "string" && ["call", "put"].includes(optionTypePatch) ? optionTypePatch : null;
  if (strikePricePatch !== undefined) updateData.strikePrice = typeof strikePricePatch === "number" && isFinite(strikePricePatch) ? strikePricePatch : null;
  if (expiryDatePatch !== undefined) updateData.expiryDate = typeof expiryDatePatch === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiryDatePatch) ? expiryDatePatch : null;
  if (multiplierPatch !== undefined) updateData.multiplier = typeof multiplierPatch === "number" && isFinite(multiplierPatch) && multiplierPatch > 0 ? multiplierPatch : null;
  if (tradingAccountIdPatch !== undefined) updateData.tradingAccountId = typeof tradingAccountIdPatch === "string" && tradingAccountIdPatch ? tradingAccountIdPatch : null;
  if (confidencePatch !== undefined) updateData.confidence = typeof confidencePatch === "number" && confidencePatch >= 1 && confidencePatch <= 10 ? Math.round(confidencePatch) : null;
  if (marketConditionPatch !== undefined) updateData.marketCondition = typeof marketConditionPatch === "string" && ["trending","ranging","breakout","reversal"].includes(marketConditionPatch) ? marketConditionPatch : null;
  if (timeframePatch !== undefined) updateData.timeframe = typeof timeframePatch === "string" && timeframePatch.trim() ? timeframePatch.trim().slice(0, 10) : null;
  if (sessionTypePatch !== undefined) updateData.sessionType = typeof sessionTypePatch === "string" && ["asian","london","new_york","overlap_london_ny"].includes(sessionTypePatch) ? sessionTypePatch : null;
  if (lotSizePatch !== undefined) updateData.lotSize = typeof lotSizePatch === "number" && isFinite(lotSizePatch) && lotSizePatch > 0 ? lotSizePatch : null;
  if (pipsPatch !== undefined) updateData.pips = typeof pipsPatch === "number" && isFinite(pipsPatch) ? pipsPatch : null;
  if (swapPatch !== undefined) updateData.swap = typeof swapPatch === "number" && isFinite(swapPatch) ? swapPatch : null;
  if (screenshotUrlsPatch !== undefined) updateData.screenshotUrls = Array.isArray(screenshotUrlsPatch) && screenshotUrlsPatch.length > 0 ? JSON.stringify(screenshotUrlsPatch.slice(0, 5)) : (screenshotUrlsPatch === null ? null : (typeof screenshotUrlsPatch === "string" ? screenshotUrlsPatch : undefined));
  if (riskAmount !== undefined) {
    const ra = typeof riskAmount === "number" && isFinite(riskAmount) ? riskAmount : null;
    updateData.riskAmount = ra;
    const currentPnl = pnl !== undefined ? (typeof pnl === "number" ? pnl : null) : existing.pnl;
    updateData.rMultiple = ra && ra > 0 && currentPnl !== null ? Math.round((currentPnl / ra) * 100) / 100 : null;
  }

  // Recompute grade from merged state
  {
    const mergedSetup = setup !== undefined ? (setup ? String(setup) : null) : existing.setup;
    const mergedReflection = reflection !== undefined ? (reflection ? String(reflection) : null) : existing.reflection;
    const mergedRisk = updateData.riskAmount !== undefined ? (updateData.riskAmount as number | null) : existing.riskAmount;
    const mergedStop = updateData.stopLoss !== undefined ? (updateData.stopLoss as number | null) : existing.stopLoss;
    updateData.grade = computeGrade({ setup: mergedSetup, reflection: mergedReflection, riskAmount: mergedRisk, stopLoss: mergedStop });
  }

  try {
    const updated = await db.tradeEntry.update({ where: { id }, data: updateData });
    return Response.json({ ok: true, entry: updated });
  } catch (err) {
    logger.error("Journal PATCH failed", err, { userId: guard.userId, id });
    return Response.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  // Deleting your own entries is free — only live broker sync/import is paid.
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const entry = await db.tradeEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await db.tradeEntry.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Journal DELETE failed", err, { userId: guard.userId, id });
    return Response.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}