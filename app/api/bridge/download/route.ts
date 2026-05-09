// Serves MT4/MT5 Expert Advisor files and redirects for binary downloads.
// Set EDGEBRIDGE_URL_WIN and EDGEBRIDGE_URL_MAC env vars to wherever
// the compiled binaries are hosted (S3, R2, Vercel Blob, etc.).
import { NextRequest } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) return Response.json({ error: "file required" }, { status: 400 });

  // Binary installers — redirect to CDN URLs configured via env vars
  if (file === "windows" || file === "EdgeBridge-Setup.exe") {
    const url = process.env.EDGEBRIDGE_URL_WIN;
    if (!url) return Response.json({ error: "Windows build not yet available" }, { status: 503 });
    return Response.redirect(url, 302);
  }
  if (file === "mac" || file === "EdgeBridge.dmg") {
    const url = process.env.EDGEBRIDGE_URL_MAC;
    if (!url) return Response.json({ error: "macOS build not yet available" }, { status: 503 });
    return Response.redirect(url, 302);
  }

  // MQL files — serve directly from the desktop/mql folder
  const allowed = ["TradeMindBridge.mq4", "TradeMindBridge.mq5"];
  if (!allowed.includes(file)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "desktop", "mql", file);

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}