import { db } from "./db";
import { safeDecrypt } from "./crypto";

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 600): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

async function logBrokerError(userId: string, broker: string, action: string, err: unknown) {
  db.appError.create({
    data: {
      userId,
      message: `lockBroker(${broker}) ${action} failed: ${String(err)}`,
      level: "warn",
      route: "/lib/circuitBreakerLock",
      context: JSON.stringify({ broker, action }),
    },
  }).catch(() => {});
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function lockBroker(userId: string): Promise<void> {
  const conn = await db.brokerConnection.findUnique({
    where: { userId },
    select: { broker: true, apiKey: true, apiSecret: true, environment: true },
  });
  if (!conn) return;

  const key    = safeDecrypt(conn.apiKey);
  const secret = conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined;

  switch (conn.broker) {
    case "alpaca":
      await withRetry(() => alpacaSuspend(key, secret, conn.environment, true))
        .catch((e) => logBrokerError(userId, "alpaca", "suspend_trade", e));
      break;
    case "metaapi":
      await withRetry(() => metaApiCancelPending(key))
        .catch((e) => logBrokerError(userId, "metaapi", "cancel_pending", e));
      break;
    case "binance":
      await withRetry(() => binanceCancelAll(key, secret!))
        .catch((e) => logBrokerError(userId, "binance", "cancel_all", e));
      break;
    case "bybit":
      await withRetry(() => bybitCancelAll(key, secret!))
        .catch((e) => logBrokerError(userId, "bybit", "cancel_all", e));
      break;
    // Others: Chrome extension network blocking is the active layer
  }
}

export async function unlockBroker(userId: string): Promise<void> {
  const conn = await db.brokerConnection.findUnique({
    where: { userId },
    select: { broker: true, apiKey: true, apiSecret: true, environment: true },
  });
  if (!conn) return;

  const key    = safeDecrypt(conn.apiKey);
  const secret = conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined;

  if (conn.broker === "alpaca") {
    await alpacaSuspend(key, secret, conn.environment, false);
  }
  // Binance/Bybit/MetaAPI: orders were just cancelled, account itself wasn't locked — no unlock needed
}

// ─── Alpaca ───────────────────────────────────────────────────────────────────
// PATCH /v2/account/configurations { suspend_trade: true/false }
// Alpaca's official API for programmatic trading suspension.

async function alpacaSuspend(
  apiKey: string,
  apiSecret: string | undefined,
  env: string,
  suspend: boolean
): Promise<void> {
  const base = env === "paper"
    ? "https://paper-api.alpaca.markets"
    : "https://api.alpaca.markets";

  const res = await fetch(`${base}/v2/account/configurations`, {
    method: "PATCH",
    headers: {
      "APCA-API-KEY-ID": apiKey,
      "APCA-API-SECRET-KEY": apiSecret ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ suspend_trade: suspend }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Alpaca ${res.status}`);
}

// ─── MetaAPI ──────────────────────────────────────────────────────────────────
// Fetches all MT4/MT5 accounts via MetaAPI and cancels all pending orders.
// Open positions are left untouched — only PENDING orders are removed.

async function metaApiCancelPending(token: string): Promise<void> {
  const host = "https://mt-client-api-v1.new-york.agiliumtrade.ai";

  let accounts: Array<{ id: string }> = [];
  try {
    const res = await fetch(`${host}/users/current/accounts?limit=100`, {
      headers: { "auth-token": token },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return;
    accounts = await res.json();
  } catch { return; }

  for (const account of accounts) {
    try {
      // Get all pending orders for this account
      const ordRes = await fetch(`${host}/users/current/accounts/${account.id}/orders`, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(10000),
      });
      if (!ordRes.ok) continue;
      const orders: Array<{ id: string }> = await ordRes.json();

      // Cancel each pending order
      await Promise.allSettled(
        orders.map((order) =>
          fetch(`${host}/users/current/accounts/${account.id}/orders/${order.id}`, {
            method: "DELETE",
            headers: { "auth-token": token },
            signal: AbortSignal.timeout(8000),
          })
        )
      );
    } catch { /* continue with next account */ }
  }
}

// ─── Binance ──────────────────────────────────────────────────────────────────
// DELETE /api/v3/openOrders — cancels ALL open orders on spot.
// Requires HMAC-SHA256 signature.

async function binanceCancelAll(apiKey: string, apiSecret: string): Promise<void> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}&recvWindow=5000`;
  const signature = await hmacSha256(apiSecret, queryString);
  const url = `https://api.binance.com/api/v3/openOrders?${queryString}&signature=${signature}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: { "X-MBX-APIKEY": apiKey },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Binance ${res.status}`);
}

// ─── Bybit ────────────────────────────────────────────────────────────────────
// POST /v5/order/cancel-all — cancels all active orders.

async function bybitCancelAll(apiKey: string, apiSecret: string): Promise<void> {
  const timestamp = Date.now().toString();
  const recv = "5000";
  const body = JSON.stringify({ category: "linear", settleCoin: "USDT" });
  const preSign = `${timestamp}${apiKey}${recv}${body}`;
  const signature = await hmacSha256(apiSecret, preSign);

  const res = await fetch("https://api.bybit.com/v5/order/cancel-all", {
    method: "POST",
    headers: {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recv,
      "X-BAPI-SIGN": signature,
      "Content-Type": "application/json",
    },
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Bybit ${res.status}`);
}

// ─── Shared crypto helper ─────────────────────────────────────────────────────

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", keyMaterial, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}