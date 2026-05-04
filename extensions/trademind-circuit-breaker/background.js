// TradeMind Circuit Breaker — Background Service Worker
// Polls the TradeMind API every 5 minutes and caches the block status.

const API_BASE = "https://trademindedge.com";
const POLL_INTERVAL_MINUTES = 5;
const ALARM_NAME = "trademind-poll";

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
    const res = await fetch(`${API_BASE}/api/circuit-breaker/status?token=${token}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 401) {
        // Token invalid — clear cached status
        await chrome.storage.local.set({ status: null, lastPoll: Date.now() });
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    await chrome.storage.local.set({ status: data, lastPoll: Date.now(), error: null });

    // Notify all content scripts of the new status
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "STATUS_UPDATE", status: data }).catch(() => {});
      }
    }

    // Show notification when just blocked
    if (data.blocked) {
      const prev = await chrome.storage.session.get("wasBlocked");
      if (!prev.wasBlocked) {
        showBlockedNotification(data);
      }
      await chrome.storage.session.set({ wasBlocked: true });
    } else {
      await chrome.storage.session.set({ wasBlocked: false });
    }
  } catch (err) {
    await chrome.storage.local.set({ error: String(err), lastPoll: Date.now() });
  }
}

function showBlockedNotification(status) {
  chrome.notifications.create("trademind-blocked", {
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "TradeMind — Trade Limit Reached",
    message: `You've hit your daily limit of ${status.effectiveLimit} trade${status.effectiveLimit === 1 ? "" : "s"}. Circuit breaker is active.`,
    priority: 2,
  });
}

// ─── Messages from popup ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "POLL_NOW") {
    poll().then(() => sendResponse({ ok: true }));
    return true;
  }
});