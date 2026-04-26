export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (body?.confirm !== "DELETE") {
    return Response.json({ error: "Pass { confirm: 'DELETE' } to confirm" }, { status: 400 });
  }

  const userId = session.user.id;

  // Cascade deletes all related data (onDelete: Cascade in schema)
  await db.user.delete({ where: { id: userId } });

  return Response.json({ ok: true, message: "Account and all data permanently deleted." });
}