import { NextRequest } from "next/server";

const ALLOWED_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) return Response.json({ error: "url required" }, { status: 400 });

  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return Response.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(rawUrl, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ error: `upstream ${res.status}` }, { status: res.status });
    const data = await res.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch {
    return Response.json({ error: "fetch failed" }, { status: 502 });
  }
}