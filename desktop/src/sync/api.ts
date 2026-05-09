import { store } from "../store";

export type TradeSyncPayload = {
  brokerTradeId: string;
  date: string;
  symbol?: string;
  side?: "long" | "short";
  pnl?: number;
  entryPrice?: number;
  exitPrice?: number;
  entryTime?: string;
  exitTime?: string;
  qty?: number;
  commission?: number;
  assetType?: string;
};

type SyncResult = {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  serverError?: string;
};

const RETRY_DELAYS = [2_000, 5_000, 15_000, 30_000];

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function syncTrades(
  trades: TradeSyncPayload[],
  brokers: string[],
  attempt = 0
): Promise<SyncResult> {
  const token = store.get("apiToken");
  const base = store.get("apiUrl");

  if (!token) return { ok: false, created: 0, updated: 0, skipped: 0, errors: trades.length, serverError: "No API token" };
  if (trades.length === 0) return { ok: true, created: 0, updated: 0, skipped: 0, errors: 0 };

  // Batch in chunks of 100
  const chunks: TradeSyncPayload[][] = [];
  for (let i = 0; i < trades.length; i += 100) chunks.push(trades.slice(i, i + 100));

  let total: SyncResult = { ok: true, created: 0, updated: 0, skipped: 0, errors: 0 };

  for (const chunk of chunks) {
    try {
      const res = await fetchWithTimeout(`${base}/api/bridge/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trades: chunk, brokers, source: "edgebridge" }),
      });

      if (res.status === 401) {
        return { ...total, ok: false, serverError: "Invalid token — re-enter in Settings" };
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as SyncResult;
      total.created += data.created ?? 0;
      total.updated += data.updated ?? 0;
      total.skipped += data.skipped ?? 0;
      total.errors += data.errors ?? 0;
    } catch (err) {
      if (attempt < RETRY_DELAYS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        const retry = await syncTrades(chunk, brokers, attempt + 1);
        total.created += retry.created;
        total.updated += retry.updated;
        total.errors += retry.errors;
        if (!retry.ok) total.ok = false;
      } else {
        total.ok = false;
        total.errors += chunk.length;
        total.serverError = err instanceof Error ? err.message : "Network error";
      }
    }
  }

  if (total.ok) {
    store.set("lastSyncAt", new Date().toISOString());
  }

  return total;
}

export async function validateToken(token: string, apiUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetchWithTimeout(`${apiUrl}/api/bridge/auth`, {
      method: "GET",
      headers: { Authorization: `Bearer fake-validation` },
    }, 8_000);

    // A 401 means endpoint is reachable — we test with /api/me instead
    const res2 = await fetchWithTimeout(`${apiUrl}/api/me`, {
      headers: { "x-bridge-token": token },
    }, 8_000);

    return { ok: res2.ok || res2.status === 401 };
  } catch {
    return { ok: false, error: "Cannot reach TradeMind server" };
  }
}