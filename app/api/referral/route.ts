export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";

function generateCode(name: string | null): string {
  const base = name
    ? name.replace(/\s+/g, "").toUpperCase().slice(0, 6)
    : "TRADER";
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `${base}${suffix}`;
}

// GET — get or create referral for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  let referral = await db.referral.findUnique({ where: { userId } });

  if (!referral) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
    let code = generateCode(user?.name ?? null);
    // Ensure uniqueness
    let exists = await db.referral.findUnique({ where: { code } });
    while (exists) {
      code = generateCode(user?.name ?? null);
      exists = await db.referral.findUnique({ where: { code } });
    }
    referral = await db.referral.create({ data: { userId, code } });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trademindedge.com";
  return Response.json({
    code: referral.code,
    usedCount: referral.usedCount,
    link: `${baseUrl.trim()}/?ref=${referral.code}`,
  });
}

// POST — track a referral usage (called when someone signs up with ?ref=CODE)
export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return Response.json({ ok: false });

  try {
    await db.referral.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  } catch {}

  return Response.json({ ok: true });
}