import { rateLimit } from "@/lib/ratelimit";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse , NextRequest} from "next/server";

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(...cols: (string | number | null | undefined)[]): string {
  return cols.map(escapeCsv).join(",");
}

export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [checkins, trades] = await Promise.all([
    db.checkin.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: { date: true, score: true, verdict: true, createdAt: true },
    }),
    db.tradeEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: {
        date: true, symbol: true, side: true, pnl: true,
        entryPrice: true, exitPrice: true, stopLoss: true, takeProfit: true,
        riskAmount: true, rMultiple: true, commission: true,
        assetType: true, duration: true, mae: true, mfe: true,
        setup: true, emotionBefore: true, emotionAfter: true,
        mistake: true, notes: true, checkinScore: true,
        tags: true, reflection: true, createdAt: true,
      },
    }),
  ]);

  const lines: string[] = [];

  lines.push("=== CHECK-INS ===");
  lines.push(row("Date", "Score", "Verdict", "Logged At"));
  for (const c of checkins) {
    lines.push(row(c.date, c.score, c.verdict, new Date(c.createdAt).toISOString()));
  }

  lines.push("");
  lines.push("=== TRADE JOURNAL ===");
  lines.push(row("Date", "Symbol", "Side", "PnL", "EntryPrice", "ExitPrice", "StopLoss", "TakeProfit", "RiskAmount", "RMultiple", "Commission", "AssetType", "DurationSec", "MAE", "MFE", "Setup", "EmotionBefore", "EmotionAfter", "Mistake", "Notes", "MentalScore", "Tags", "Reflection", "Logged At"));
  for (const t of trades) {
    lines.push(row(
      t.date, t.symbol, t.side, t.pnl,
      t.entryPrice, t.exitPrice, t.stopLoss, t.takeProfit,
      t.riskAmount, t.rMultiple, t.commission,
      t.assetType, t.duration, t.mae, t.mfe,
      t.setup, t.emotionBefore, t.emotionAfter,
      t.mistake, t.notes, t.checkinScore,
      t.tags, t.reflection,
      new Date(t.createdAt).toISOString(),
    ));
  }

  const csv = lines.join("\n");
  const today = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trademind-export-${today}.csv"`,
    },
  });
}