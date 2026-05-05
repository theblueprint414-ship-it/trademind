interface BrokerConfig {
  broker: string;
  apiKey: string;
  apiSecret?: string;
  environment: string;
}

export interface TestResult {
  ok: boolean;
  error?: string;
  token?: string; // returned for password-based auth (e.g. Tradovate) — we store token, never the password
}

const REQUEST_TIMEOUT_MS = 10_000;

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ── Test connection ──────────────────────────────────────────────────────────

export async function testBrokerConnection(config: BrokerConfig): Promise<TestResult> {
  try {
    switch (config.broker) {
      case "alpaca":       return await testAlpaca(config);
      case "binance":      return await testBinance(config);
      case "bybit":        return await testBybit(config);
      case "coinbase":     return await testCoinbase(config);
      case "kraken":       return await testKraken(config);
      case "tradovate":    return await testTradovate(config);
      case "topstepx":     return await testTopstepX(config);
      case "metaapi":      return await testMetaApi(config);
      case "tradestation": return { ok: false, error: "TradeStation integration coming soon" };
      case "ibkr":         return { ok: false, error: "IBKR integration coming soon" };
      case "mt4":          return { ok: false, error: "MT4/MT5 integration coming soon" };
      default:             return { ok: false, error: "Unsupported broker" };
    }
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { ok: false, error: "Connection timed out. Check your credentials and try again." };
    }
    return { ok: false, error: "Connection failed. Check your credentials." };
  }
}

// ── Historical trade entry ───────────────────────────────────────────────────

export interface TradeHistoryEntry {
  date: string;
  symbol: string;
  side: "long" | "short";
  pnl: number | null;
}

export async function fetchHistoricalTrades(
  config: BrokerConfig,
  days = 90
): Promise<TradeHistoryEntry[] | null> {
  try {
    switch (config.broker) {
      case "alpaca":    return await alpacaHistory(config, days);
      case "bybit":     return await bybitHistory(config, days);
      case "coinbase":  return await coinbaseHistory(config, days);
      case "kraken":    return await krakenHistory(config, days);
      case "tradovate": return await tradovateHistory(config, days);
      case "binance":   return await binanceHistory(config, days);
      case "topstepx":  return await topstepXHistory(config, days);
      case "metaapi":   return await metaApiHistory(config, days);
      default:          return [];
    }
  } catch {
    return null;
  }
}

// ── Fetch today's trade count ────────────────────────────────────────────────

export async function fetchTodayTrades(config: BrokerConfig): Promise<number | null> {
  try {
    switch (config.broker) {
      case "alpaca":    return await alpacaTodayTrades(config);
      case "binance":   return await binanceTodayTrades(config);
      case "bybit":     return await bybitTodayTrades(config);
      case "coinbase":  return await coinbaseTodayTrades(config);
      case "kraken":    return await krakenTodayTrades(config);
      case "tradovate": return await tradovateTodayTrades(config);
      case "topstepx":  return await topstepXTodayTrades(config);
      case "metaapi":   return await metaApiTodayTrades(config);
      default:          return null;
    }
  } catch {
    return null;
  }
}

export async function fetchTopstepXDailyData(config: BrokerConfig): Promise<{ count: number; pnl: number } | null> {
  if (config.broker !== "topstepx") return null;
  try {
    const token = await topstepXAuth(config.apiKey, config.apiSecret ?? "");
    if (!token) return null;
    const accountId = await topstepXGetAccountId(token);
    if (!accountId) return null;
    const today = new Date().toISOString().split("T")[0];
    const trades = await topstepXSearchTrades(token, accountId, `${today}T00:00:00.000Z`);
    if (!trades) return null;
    const pnl = trades.reduce((sum, t) => sum + (t.profitAndLoss ?? 0), 0);
    return { count: trades.length, pnl };
  } catch {
    return null;
  }
}

// ── Alpaca ───────────────────────────────────────────────────────────────────

const alpacaBase = (env: string) =>
  env === "paper" ? "https://paper-api.alpaca.markets" : "https://api.alpaca.markets";

async function testAlpaca({ apiKey, apiSecret, environment }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "API Secret required for Alpaca" };
  const res = await fetch(`${alpacaBase(environment)}/v2/account`, {
    headers: { "APCA-API-KEY-ID": apiKey, "APCA-API-SECRET-KEY": apiSecret },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (res.ok) return { ok: true };
  if (res.status === 401) return { ok: false, error: "Invalid API key or secret" };
  return { ok: false, error: `Alpaca error: ${res.status}` };
}

async function alpacaTodayTrades({ apiKey, apiSecret, environment }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${alpacaBase(environment)}/v2/orders?status=filled&after=${today}T00:00:00Z&limit=100&direction=asc`,
    {
      headers: { "APCA-API-KEY-ID": apiKey, "APCA-API-SECRET-KEY": apiSecret },
      signal: withTimeout(REQUEST_TIMEOUT_MS),
    }
  );
  if (!res.ok) return null;
  const orders = await res.json();
  return Array.isArray(orders) ? orders.length : null;
}

// ── Binance ──────────────────────────────────────────────────────────────────

async function testBinance({ apiKey }: BrokerConfig): Promise<TestResult> {
  const res = await fetch("https://api.binance.com/api/v3/account", {
    headers: { "X-MBX-APIKEY": apiKey },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (res.ok) return { ok: true };
  if (res.status === 401) return { ok: false, error: "Invalid API key" };
  return { ok: false, error: `Binance error: ${res.status}` };
}

async function binanceTodayTrades({ apiKey, apiSecret }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const timestamp = Date.now();
  // /fapi/v1/income works without a symbol — one entry per realized P&L event (= one closed trade).
  // Spot /api/v3/myTrades requires a symbol, so futures endpoint is the only viable option here.
  const query = `incomeType=REALIZED_PNL&startTime=${startOfDay.getTime()}&timestamp=${timestamp}&limit=1000`;
  const signature = await hmacSHA256(apiSecret, query);
  const res = await fetch(
    `https://fapi.binance.com/fapi/v1/income?${query}&signature=${signature}`,
    { headers: { "X-MBX-APIKEY": apiKey }, signal: withTimeout(REQUEST_TIMEOUT_MS) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data.length : null;
}

// ── Bybit ────────────────────────────────────────────────────────────────────

async function testBybit({ apiKey, apiSecret }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "API Secret required for Bybit" };
  const timestamp = Date.now().toString();
  const sign = await hmacSHA256(apiSecret, timestamp + apiKey + "5000" + "");
  const res = await fetch("https://api.bybit.com/v5/account/wallet-balance?accountType=UNIFIED", {
    headers: {
      "X-BAPI-API-KEY": apiKey, "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-SIGN": sign, "X-BAPI-RECV-WINDOW": "5000",
    },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (res.ok) {
    const data = await res.json();
    if (data.retCode === 0) return { ok: true };
    return { ok: false, error: data.retMsg ?? "Invalid credentials" };
  }
  return { ok: false, error: `Bybit error: ${res.status}` };
}

async function bybitTodayTrades({ apiKey, apiSecret }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const startTime = new Date().setHours(0, 0, 0, 0);

  async function fetchCategory(category: string): Promise<number | null> {
    const timestamp = Date.now().toString();
    const params = `category=${category}&startTime=${startTime}&limit=200`;
    const sign = await hmacSHA256(apiSecret!, timestamp + apiKey + "5000" + params);
    const res = await fetch(`https://api.bybit.com/v5/execution/list?${params}`, {
      headers: { "X-BAPI-API-KEY": apiKey, "X-BAPI-TIMESTAMP": timestamp, "X-BAPI-SIGN": sign, "X-BAPI-RECV-WINDOW": "5000" },
      signal: withTimeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.result?.list) ? data.result.list.length : null;
  }

  const [spot, linear] = await Promise.all([fetchCategory("spot"), fetchCategory("linear")]);
  if (spot === null && linear === null) return null;
  return (spot ?? 0) + (linear ?? 0);
}

// ── Coinbase Advanced Trade ──────────────────────────────────────────────────

async function testCoinbase({ apiKey, apiSecret }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "API Secret required for Coinbase" };
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const path = "/api/v3/brokerage/accounts";
  const signature = await hmacSHA256(apiSecret, timestamp + "GET" + path + "");
  const res = await fetch(`https://api.coinbase.com${path}`, {
    headers: {
      "CB-ACCESS-KEY": apiKey, "CB-ACCESS-SIGN": signature,
      "CB-ACCESS-TIMESTAMP": timestamp, "Content-Type": "application/json",
    },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (res.ok) return { ok: true };
  if (res.status === 401) return { ok: false, error: "Invalid API key or secret" };
  return { ok: false, error: `Coinbase error: ${res.status}` };
}

async function coinbaseTodayTrades({ apiKey, apiSecret }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const path = "/api/v3/brokerage/orders/historical/batch?order_status=FILLED&limit=100";
  const signature = await hmacSHA256(apiSecret, timestamp + "GET" + path + "");
  const res = await fetch(`https://api.coinbase.com${path}`, {
    headers: { "CB-ACCESS-KEY": apiKey, "CB-ACCESS-SIGN": signature, "CB-ACCESS-TIMESTAMP": timestamp },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data.orders)) return null;
  const today = new Date().toISOString().split("T")[0];
  return data.orders.filter((o: { last_fill_time?: string }) => o.last_fill_time?.startsWith(today)).length;
}

// ── Kraken ───────────────────────────────────────────────────────────────────

async function testKraken({ apiKey, apiSecret }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "Private Key required for Kraken" };
  const nonce = Date.now().toString();
  const path = "/0/private/Balance";
  const postData = `nonce=${nonce}`;
  const signature = await krakenSign(apiSecret, path, nonce, postData);
  const res = await fetch(`https://api.kraken.com${path}`, {
    method: "POST",
    headers: { "API-Key": apiKey, "API-Sign": signature, "Content-Type": "application/x-www-form-urlencoded" },
    body: postData,
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return { ok: false, error: `Kraken error: ${res.status}` };
  const data = await res.json();
  if (data.error?.length) return { ok: false, error: data.error[0] };
  return { ok: true };
}

async function krakenTodayTrades({ apiKey, apiSecret }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const nonce = Date.now().toString();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const start = Math.floor(startOfDay.getTime() / 1000).toString();
  const path = "/0/private/TradesHistory";
  const postData = `nonce=${nonce}&start=${start}`;
  const signature = await krakenSign(apiSecret, path, nonce, postData);
  const res = await fetch(`https://api.kraken.com${path}`, {
    method: "POST",
    headers: { "API-Key": apiKey, "API-Sign": signature, "Content-Type": "application/x-www-form-urlencoded" },
    body: postData,
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error?.length) return null;
  return Object.keys(data.result?.trades ?? {}).length;
}

async function krakenSign(secret: string, path: string, nonce: string, postData: string): Promise<string> {
  const enc = new TextEncoder();
  const secretBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));
  const sha256 = await crypto.subtle.digest("SHA-256", enc.encode(nonce + postData));
  const combined = new Uint8Array(enc.encode(path).length + sha256.byteLength);
  combined.set(enc.encode(path), 0);
  combined.set(new Uint8Array(sha256), enc.encode(path).length);
  const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, combined);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ── Tradovate ────────────────────────────────────────────────────────────────
// Auth: username + password → access token (token is stored, password is NEVER stored)

const tradovateBase = (env: string) =>
  env === "paper" ? "https://demo.tradovateapi.com/v1" : "https://live.tradovateapi.com/v1";

async function testTradovate({ apiKey, apiSecret, environment }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "Password required for Tradovate" };

  const cid = process.env.TRADOVATE_CID ? parseInt(process.env.TRADOVATE_CID) : 0;
  const sec = process.env.TRADOVATE_SEC ?? "";

  if (!cid || !sec) {
    return { ok: false, error: "Tradovate integration is not yet configured on this server. Contact support." };
  }

  const res = await fetch(`${tradovateBase(environment)}/auth/accesstokenrequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: apiKey,
      password: apiSecret,
      appId: "TradeMind",
      appVersion: "1.0",
      cid,
      sec,
    }),
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.accessToken) {
    const msg = data.errorText ?? data.p ?? data.message ?? null;
    if (msg?.toLowerCase().includes("not authorized") || msg?.toLowerCase().includes("nostro")) {
      return { ok: false, error: "This Tradovate account type does not support API access. Nostro/prop accounts require a separate API agreement with Tradovate." };
    }
    return { ok: false, error: msg ?? "Authentication failed. Check your username and password." };
  }

  return { ok: true, token: data.accessToken };
}

async function tradovateTodayTrades({ apiKey, environment }: BrokerConfig): Promise<number | null> {
  // apiKey here is the stored access token (after token exchange at connect time)
  const today = new Date().toISOString().split("T")[0];
  const startOfDay = new Date(`${today}T00:00:00.000Z`).toISOString();
  const res = await fetch(
    `${tradovateBase(environment)}/order/list`,
    {
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: withTimeout(REQUEST_TIMEOUT_MS),
    }
  );
  if (!res.ok) return null;
  const orders: Array<{ timestamp?: string; ordStatus?: string }> = await res.json();
  if (!Array.isArray(orders)) return null;
  return orders.filter(
    (o) => o.ordStatus === "Filled" && o.timestamp && o.timestamp >= startOfDay
  ).length;
}

// ── Historical trade fetchers ────────────────────────────────────────────────

async function alpacaHistory({ apiKey, apiSecret, environment }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!apiSecret) return [];
  const after = new Date();
  after.setDate(after.getDate() - days);
  const res = await fetch(
    `${alpacaBase(environment)}/v2/orders?status=filled&after=${after.toISOString()}&limit=500&direction=asc`,
    { headers: { "APCA-API-KEY-ID": apiKey, "APCA-API-SECRET-KEY": apiSecret }, signal: withTimeout(REQUEST_TIMEOUT_MS) }
  );
  if (!res.ok) return [];
  const orders = await res.json();
  if (!Array.isArray(orders)) return [];
  return orders.map((o: { symbol: string; side: string; filled_at: string }) => ({
    date: o.filled_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
    symbol: o.symbol ?? "UNKNOWN",
    side: o.side === "buy" ? "long" : "short",
    pnl: null,
  }));
}

async function bybitHistory({ apiKey, apiSecret }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!apiSecret) return [];
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const timestamp = Date.now().toString();
  const params = `category=linear&limit=200&startTime=${startTime}`;
  const sign = await hmacSHA256(apiSecret, timestamp + apiKey + "5000" + params);
  const res = await fetch(`https://api.bybit.com/v5/position/closed-pnl?${params}`, {
    headers: { "X-BAPI-API-KEY": apiKey, "X-BAPI-TIMESTAMP": timestamp, "X-BAPI-SIGN": sign, "X-BAPI-RECV-WINDOW": "5000" },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data.result?.list)) return [];
  return data.result.list.map((t: { symbol: string; side: string; closedPnl: string; createdTime: string }) => ({
    date: new Date(parseInt(t.createdTime)).toISOString().split("T")[0],
    symbol: t.symbol,
    side: t.side === "Buy" ? "long" : "short",
    pnl: t.closedPnl ? parseFloat(t.closedPnl) : null,
  }));
}

async function coinbaseHistory({ apiKey, apiSecret }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!apiSecret) return [];
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const path = "/api/v3/brokerage/orders/historical/batch?order_status=FILLED&limit=250";
  const signature = await hmacSHA256(apiSecret, timestamp + "GET" + path + "");
  const res = await fetch(`https://api.coinbase.com${path}`, {
    headers: { "CB-ACCESS-KEY": apiKey, "CB-ACCESS-SIGN": signature, "CB-ACCESS-TIMESTAMP": timestamp },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data.orders)) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.orders
    .filter((o: { last_fill_time?: string }) => o.last_fill_time && new Date(o.last_fill_time) >= cutoff)
    .map((o: { product_id: string; side: string; last_fill_time: string }) => ({
      date: o.last_fill_time.split("T")[0],
      symbol: o.product_id,
      side: o.side === "BUY" ? "long" : "short",
      pnl: null,
    }));
}

async function krakenHistory({ apiKey, apiSecret }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!apiSecret) return [];
  const nonce = Date.now().toString();
  const start = Math.floor((Date.now() - days * 86400000) / 1000).toString();
  const path = "/0/private/TradesHistory";
  const postData = `nonce=${nonce}&start=${start}`;
  const signature = await krakenSign(apiSecret, path, nonce, postData);
  const res = await fetch(`https://api.kraken.com${path}`, {
    method: "POST",
    headers: { "API-Key": apiKey, "API-Sign": signature, "Content-Type": "application/x-www-form-urlencoded" },
    body: postData,
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.error?.length || !data.result?.trades) return [];
  return Object.values(data.result.trades).map((t) => {
    const trade = t as { pair: string; type: string; time: number };
    return {
      date: new Date(trade.time * 1000).toISOString().split("T")[0],
      symbol: trade.pair,
      side: trade.type === "buy" ? "long" : "short",
      pnl: null,
    };
  });
}

async function tradovateHistory({ apiKey, environment }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();
  const res = await fetch(`${tradovateBase(environment)}/order/list`, {
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return [];
  const orders: Array<{ timestamp?: string; ordStatus?: string; symbol?: string; action?: string }> = await res.json();
  if (!Array.isArray(orders)) return [];
  return orders
    .filter((o) => o.ordStatus === "Filled" && o.timestamp && o.timestamp >= cutoffStr)
    .map((o) => ({
      date: o.timestamp!.split("T")[0],
      symbol: o.symbol ?? "UNKNOWN",
      side: o.action === "Buy" ? "long" : "short",
      pnl: null,
    }));
}

async function binanceHistory({ apiKey, apiSecret }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  // Binance requires a symbol per request — fetch from futures income instead
  if (!apiSecret) return [];
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const timestamp = Date.now();
  const query = `incomeType=REALIZED_PNL&startTime=${startTime}&timestamp=${timestamp}&limit=1000`;
  const signature = await hmacSHA256(apiSecret, query);
  const res = await fetch(
    `https://fapi.binance.com/fapi/v1/income?${query}&signature=${signature}`,
    { headers: { "X-MBX-APIKEY": apiKey }, signal: withTimeout(REQUEST_TIMEOUT_MS) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((t: { symbol: string; income: string; time: number }) => ({
    date: new Date(t.time).toISOString().split("T")[0],
    symbol: t.symbol,
    side: parseFloat(t.income) >= 0 ? "long" : "short",
    pnl: parseFloat(t.income),
  }));
}

// ── MetaApi (MT4/MT5) ────────────────────────────────────────────────────────
// apiKey  = MetaApi account ID (stored after creation; initially = MT4 login)
// apiSecret = MT4/MT5 investor password (read-only)
// environment = MT4/MT5 server name (e.g. "ICMarkets-Demo02")
// Requires METAAPI_TOKEN env var (server-side API key from metaapi.cloud)

const METAAPI_BASE = "https://metaapi.cloud";

function metaApiHeaders(): Record<string, string> {
  return { "auth-token": process.env.METAAPI_TOKEN ?? "", "Content-Type": "application/json" };
}

async function metaApiCreateOrFind(login: string, password: string, server: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  // Check if account already registered
  const listRes = await fetch(`${METAAPI_BASE}/users/current/accounts?limit=100`, {
    headers: metaApiHeaders(),
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (listRes.ok) {
    const list = await listRes.json();
    const items: Array<{ id: string; login: string; server: string }> = list.items ?? list;
    const found = items.find((a) => String(a.login) === String(login) && a.server === server);
    if (found) return { ok: true, id: found.id };
  }

  // Try MT4 first, then MT5
  for (const platform of ["mt4", "mt5"]) {
    const res = await fetch(`${METAAPI_BASE}/users/current/accounts`, {
      method: "POST",
      headers: metaApiHeaders(),
      body: JSON.stringify({ login, password, name: `TradeMind-${login}`, server, platform, type: "cloud", region: "london", reliability: "regular" }),
      signal: withTimeout(REQUEST_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, id: data.id };
    }
  }
  return { ok: false, error: "Could not connect. Check your account number, investor password, and server name." };
}

async function testMetaApi({ apiKey, apiSecret, environment }: BrokerConfig): Promise<TestResult> {
  if (!process.env.METAAPI_TOKEN) return { ok: false, error: "MT4/MT5 integration not yet enabled on this server. Contact support." };
  if (!apiSecret) return { ok: false, error: "Investor password required" };
  if (!environment) return { ok: false, error: "Server name required (e.g. ICMarkets-Demo02)" };
  const result = await metaApiCreateOrFind(apiKey, apiSecret, environment);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, token: result.id };
}

async function metaApiTodayTrades({ apiKey }: BrokerConfig): Promise<number | null> {
  if (!process.env.METAAPI_TOKEN || !apiKey) return null;
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${METAAPI_BASE}/users/current/accounts/${apiKey}/history-deals/time/${encodeURIComponent(`${today}T00:00:00.000Z`)}/${encodeURIComponent(new Date().toISOString())}`,
    { headers: metaApiHeaders(), signal: withTimeout(REQUEST_TIMEOUT_MS) }
  );
  if (!res.ok) return null;
  const deals = await res.json();
  if (!Array.isArray(deals)) return null;
  return deals.filter((d: { entryType?: string }) => d.entryType === "DEAL_ENTRY_OUT").length;
}

async function metaApiHistory({ apiKey }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!process.env.METAAPI_TOKEN || !apiKey) return [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const res = await fetch(
    `${METAAPI_BASE}/users/current/accounts/${apiKey}/history-deals/time/${encodeURIComponent(start.toISOString())}/${encodeURIComponent(new Date().toISOString())}`,
    { headers: metaApiHeaders(), signal: withTimeout(REQUEST_TIMEOUT_MS) }
  );
  if (!res.ok) return [];
  const deals = await res.json();
  if (!Array.isArray(deals)) return [];
  return deals
    .filter((d: { entryType?: string }) => d.entryType === "DEAL_ENTRY_OUT")
    .map((d: { time?: string; symbol?: string; type?: string; profit?: number }) => ({
      date: (d.time ?? new Date().toISOString()).split("T")[0],
      symbol: (d.symbol ?? "FOREX").slice(0, 20),
      side: d.type === "DEAL_TYPE_SELL" ? ("short" as const) : ("long" as const),
      pnl: d.profit ?? null,
    }));
}

// ── TopstepX / ProjectX ──────────────────────────────────────────────────────

const TOPSTEPX_BASE = "https://api.thefuturesdesk.projectx.com";

interface TopstepXTrade {
  profitAndLoss: number;
  fees: number;
  creationTimestamp: string;
  contractId: string;
  side: number;
  voided: boolean;
}

async function topstepXAuth(username: string, apiKey: string): Promise<string | null> {
  const res = await fetch(`${TOPSTEPX_BASE}/api/Auth/loginKey`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "accept": "application/json" },
    body: JSON.stringify({ userName: username, apiKey }),
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.success || !data.token) return null;
  return data.token as string;
}

async function topstepXGetAccountId(token: string): Promise<number | null> {
  const res = await fetch(`${TOPSTEPX_BASE}/api/Account/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ onlyActiveAccounts: true }),
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.success || !Array.isArray(data.accounts) || data.accounts.length === 0) return null;
  return data.accounts[0].id as number;
}

async function topstepXSearchTrades(token: string, accountId: number, startTimestamp: string, endTimestamp?: string): Promise<TopstepXTrade[] | null> {
  const body: Record<string, unknown> = { accountId, startTimestamp };
  if (endTimestamp) body.endTimestamp = endTimestamp;
  const res = await fetch(`${TOPSTEPX_BASE}/api/Trade/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: withTimeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.success || !Array.isArray(data.trades)) return null;
  return (data.trades as TopstepXTrade[]).filter((t) => !t.voided);
}

async function testTopstepX({ apiKey, apiSecret }: BrokerConfig): Promise<TestResult> {
  if (!apiSecret) return { ok: false, error: "API Key required for TopstepX" };
  const token = await topstepXAuth(apiKey, apiSecret);
  if (!token) return { ok: false, error: "Invalid username or API key. Check TopstepX Settings → API." };
  const accountId = await topstepXGetAccountId(token);
  if (!accountId) return { ok: false, error: "No active TopstepX accounts found." };
  return { ok: true };
}

async function topstepXTodayTrades({ apiKey, apiSecret }: BrokerConfig): Promise<number | null> {
  if (!apiSecret) return null;
  const token = await topstepXAuth(apiKey, apiSecret);
  if (!token) return null;
  const accountId = await topstepXGetAccountId(token);
  if (!accountId) return null;
  const today = new Date().toISOString().split("T")[0];
  const trades = await topstepXSearchTrades(token, accountId, `${today}T00:00:00.000Z`);
  return trades ? trades.length : null;
}

async function topstepXHistory({ apiKey, apiSecret }: BrokerConfig, days: number): Promise<TradeHistoryEntry[]> {
  if (!apiSecret) return [];
  const token = await topstepXAuth(apiKey, apiSecret);
  if (!token) return [];
  const accountId = await topstepXGetAccountId(token);
  if (!accountId) return [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const trades = await topstepXSearchTrades(token, accountId, start.toISOString());
  if (!trades) return [];
  return trades.map((t) => ({
    date: t.creationTimestamp.split("T")[0],
    symbol: (t.contractId ?? "FUTURES").slice(0, 20),
    side: t.side > 0 ? "long" : ("short" as "long" | "short"),
    pnl: t.profitAndLoss ?? null,
  }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}