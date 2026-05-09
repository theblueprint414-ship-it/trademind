// Serves MT4/MT5 Expert Advisor files and redirects for binary downloads
import { NextRequest } from "next/server";
import * as fs from "fs";
import * as path from "path";

const GITHUB_RELEASE = "https://github.com/trademindedge/edgebridge/releases/latest/download";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) return Response.json({ error: "file required" }, { status: 400 });

  // Binary installers — redirect to GitHub releases
  if (file === "windows" || file === "EdgeBridge-Setup.exe") {
    return Response.redirect(`${GITHUB_RELEASE}/EdgeBridge-Setup.exe`, 302);
  }
  if (file === "mac" || file === "EdgeBridge.dmg") {
    return Response.redirect(`${GITHUB_RELEASE}/EdgeBridge.dmg`, 302);
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