export const runtime = "nodejs";

import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const FREE_MONTHLY_LIMIT = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  const isPremium = user.plan === "premium";

  // Rate-limit uploads for free/pro users
  if (!isPremium) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const uploadCount = await db.tradeEntry.count({
      where: {
        userId: session.user.id,
        chartUrl: { not: null },
        createdAt: { gte: startOfMonth },
      },
    });

    if (uploadCount >= FREE_MONTHLY_LIMIT) {
      return Response.json(
        { error: `Free plan is limited to ${FREE_MONTHLY_LIMIT} chart uploads per month. Upgrade to Premium for unlimited uploads.` },
        { status: 403 }
      );
    }
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `charts/${session.user.id}/${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return Response.json({ url: blob.url });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { url, tradeEntryId } = await request.json().catch(() => ({}));
  if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

  // Verify the trade entry belongs to this user before deleting
  if (tradeEntryId) {
    const entry = await db.tradeEntry.findFirst({
      where: { id: tradeEntryId, userId: session.user.id },
    });
    if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
    await db.tradeEntry.update({ where: { id: tradeEntryId }, data: { chartUrl: null } });
  }

  await del(url);
  return Response.json({ ok: true });
}