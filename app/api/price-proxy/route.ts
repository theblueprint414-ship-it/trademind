import { NextRequest } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Cache crumb for 30 minutes
let crumbCache: { crumb: string; cookie: string; ts: number } | null = null;

async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbCache && Date.now() - crumbCache.ts < 1_800_000) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
  }
  try {
    const fcRes = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    const cookie = fcRes.headers.get("set-cookie")?.split(";")[0] ?? "";

    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, "Cookie": cookie },
      signal: AbortSignal.timeout(6000),
    });
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.startsWith("<")) return null;

    crumbCache = { crumb, cookie, ts: Date.now() };
    return { crumb, cookie };
  } catch { return null; }
}

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

  const auth = await getYahooCrumb();
  const fetchUrl = auth ? `${rawUrl}&crumb=${encodeURIComponent(auth.crumb)}` : rawUrl;

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        ...(auth ? { "Cookie": auth.cookie } : {}),
      },
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