// TradeMind Circuit Breaker — Background Service Worker v2.0
// Layer 1: declarativeNetRequest blocks actual order API calls at the network level
// Layer 2: overlay + notifications (visual layer)

const API_BASE = "https://trademindedge.com";
const POLL_INTERVAL_MINUTES = 5;
const ALARM_NAME = "trademind-poll";

// ─── Order API blocking rules ─────────────────────────────────────────────────
// These block HTTP POST requests to order placement endpoints across all major brokers.
// The extension's own fetch calls are NOT affected (background SW is excluded).
const ORDER_BLOCK_RULES = [
  // Binance Spot
  { id: 101, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.binance.com/api/v3/order", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Binance Futures
  { id: 102, priority: 10, action: { type: "block" }, condition: { urlFilter: "||fapi.binance.com/fapi/v1/order", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Binance Coin-M Futures
  { id: 103, priority: 10, action: { type: "block" }, condition: { urlFilter: "||dapi.binance.com/dapi/v1/order", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Bybit — create order
  { id: 104, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.bybit.com/v5/order/create", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Bybit — batch orders
  { id: 105, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.bybit.com/v5/order/create-batch", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Alpaca Live
  { id: 106, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.alpaca.markets/v2/orders", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Alpaca Paper
  { id: 107, priority: 10, action: { type: "block" }, condition: { urlFilter: "||paper-api.alpaca.markets/v2/orders", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Coinbase Advanced Trade
  { id: 108, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.coinbase.com/api/v3/brokerage/orders", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Kraken Add Order
  { id: 109, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.kraken.com/0/private/AddOrder", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Kraken Add Order Batch
  { id: 110, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.kraken.com/0/private/AddOrderBatch", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // tastytrade
  { id: 111, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.tastytrade.com/accounts/*/orders", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Robinhood
  { id: 112, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.robinhood.com/orders/", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Robinhood options
  { id: 113, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.robinhood.com/options/orders/", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // Webull
  { id: 114, priority: 10, action: { type: "block" }, condition: { urlFilter: "||ustrade.webull.com/openapi/trade/order", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // TradeStation
  { id: 115, priority: 10, action: { type: "block" }, condition: { urlFilter: "||api.tradestation.com/v3/orderexecution/orders", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
  // moomoo
  { id: 116, priority: 10, action: { type: "block" }, condition: { urlFilter: "||openapi.moomoo.com/moomooapi/order", resourceTypes: ["xmlhttprequest", "fetch"], requestMethods: ["post"] }},
];

const BLOCK_RULE_IDS = ORDER_BLOCK_RULES.map((r) => r.id);

// ─── Startup ──────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_INTERVAL_MINUTES });
  poll();
});

chrome.runtime.onStartup.addListener(() => {
  poll();
});

// ─── Polling ──────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) poll();
});

async function poll() {
  const { token } = await chrome.storage.sync.get("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/circuit-breaker/status?token=${token}`, { cache: "no-store" });

    if (!res.ok) {
      if (res.status === 401) {
        await chrome.storage.local.set({ status: null, lastPoll: Date.now() });
        await applyNetworkRules(false);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    await chrome.storage.local.set({ status: data, lastPoll: Date.now(), error: null });

    // Apply or remove network blocking rules based on status
    await applyNetworkRules(data.blocked);

    // Notify all content scripts
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "STATUS_UPDATE", status: data }).catch(() => {});
    }

    // Push notification on first block event this session
    if (data.blocked) {
      const prev = await chrome.storage.session.get("wasBlocked");
      if (!prev.wasBlocked) showBlockedNotification(data);
      await chrome.storage.session.set({ wasBlocked: true });
    } else {
      await chrome.storage.session.set({ wasBlocked: false });
    }

    // Update extension badge
    updateBadge(data);

  } catch (err) {
    await chrome.storage.local.set({ error: String(err), lastPoll: Date.now() });
  }
}

// ─── Network rule management ──────────────────────────────────────────────────

async function applyNetworkRules(blocked) {
  if (blocked) {
    // Activate: add all blocking rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: ORDER_BLOCK_RULES,
      removeRuleIds: BLOCK_RULE_IDS, // remove first to avoid duplicate-id errors
    });
  } else {
    // Deactivate: remove all blocking rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: BLOCK_RULE_IDS,
    });
  }
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function updateBadge(status) {
  if (status.blocked) {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF3B5C" });
  } else {
    const pct = status.effectiveLimit > 0 ? Math.round((status.tradeCount / status.effectiveLimit) * 100) : 0;
    if (pct >= 80) {
      chrome.action.setBadgeText({ text: `${status.remaining}` });
      chrome.action.setBadgeBackgroundColor({ color: "#FFB547" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

function showBlockedNotification(status) {
  chrome.notifications.create("trademind-blocked", {
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "TradeMind — Trade Limit Reached",
    message: `${status.tradeCount}/${status.effectiveLimit} trades today. Order APIs are now blocked across all platforms.`,
    priority: 2,
  });
}

// ─── Messages from popup ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "POLL_NOW") {
    poll().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "GET_BLOCK_RULES_COUNT") {
    chrome.declarativeNetRequest.getDynamicRules().then((rules) => sendResponse({ count: rules.length }));
    return true;
  }
});