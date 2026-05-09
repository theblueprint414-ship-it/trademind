// Serves electron-updater manifests (latest.yml / latest-mac.yml)
// Set env vars EDGEBRIDGE_LATEST_WIN_YML and EDGEBRIDGE_LATEST_MAC_YML
// after each release to publish a new version.
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // electron-updater requests /api/bridge/update/latest.yml or /latest-mac.yml
  const file = url.pathname.split("/").pop() ?? "";

  if (file === "latest-mac.yml") {
    const yml = process.env.EDGEBRIDGE_LATEST_MAC_YML;
    if (!yml) return new Response("", { status: 204 });
    return new Response(yml, {
      headers: { "Content-Type": "text/yaml; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (file === "latest.yml") {
    const yml = process.env.EDGEBRIDGE_LATEST_WIN_YML;
    if (!yml) return new Response("", { status: 204 });
    return new Response(yml, {
      headers: { "Content-Type": "text/yaml; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response("Not found", { status: 404 });
}