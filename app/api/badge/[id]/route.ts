export const runtime = "nodejs";

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      name: true,
      checkins: {
        select: { date: true },
        orderBy: { date: "desc" },
        take: 90,
      },
    },
  });

  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const now = new Date();
  let streak = 0;
  for (let i = 0; i < user.checkins.length; i++) {
    const diff = Math.round((now.getTime() - new Date(user.checkins[i].date + "T12:00:00").getTime()) / 86400000);
    if (diff === i) streak++;
    else break;
  }

  let longestStreak = 0;
  let cur = 0;
  const sorted = [...user.checkins].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { cur = 1; continue; }
    const prev = new Date(sorted[i - 1].date + "T12:00:00");
    const curr = new Date(sorted[i].date + "T12:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) cur++;
    else cur = 1;
    if (cur > longestStreak) longestStreak = cur;
  }
  if (cur > longestStreak) longestStreak = cur;

  const best = Math.max(streak, longestStreak);
  const isElite = best >= 60;
  const isVerified = best >= 30;

  const color = isElite ? "#8B5CF6" : isVerified ? "#FFB020" : "#4F8EF7";
  const label = isElite ? "Elite Mental Edge" : isVerified ? "Verified Mental Edge" : "Mental Edge";
  const sublabel = `${best}-day streak · TradeMind`;
  const icon = isElite ? "👑" : isVerified ? "✓" : "◎";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="56">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="240" height="56" rx="10" fill="#070B14"/>
  <rect width="240" height="56" rx="10" fill="url(#bg)"/>
  <rect width="240" height="56" rx="10" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.35"/>

  <!-- TradeMind dot -->
  <circle cx="18" cy="28" r="5" fill="${color}" opacity="0.9"/>
  <circle cx="18" cy="28" r="8" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.25"/>

  <!-- Label -->
  <text x="34" y="23" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="12" font-weight="700" fill="${color}">${label}</text>
  <text x="34" y="39" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="10" fill="#7A8BA8">${sublabel}</text>

  <!-- Icon -->
  <text x="218" y="33" font-family="-apple-system,sans-serif" font-size="16" text-anchor="middle" fill="${color}">${icon}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}