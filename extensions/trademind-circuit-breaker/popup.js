// TradeMind Circuit Breaker — Popup Logic

const API_BASE = "https://trademindedge.com";

const setupView    = document.getElementById("setup-view");
const statusView   = document.getElementById("status-view");
const tokenInput   = document.getElementById("token-input");
const saveBtn      = document.getElementById("save-token-btn");
const refreshBtn   = document.getElementById("refresh-btn");
const dashboardBtn = document.getElementById("dashboard-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const statusDot    = document.getElementById("status-dot");
const headerSub    = document.getElementById("header-sub");
const lastPollEl   = document.getElementById("last-poll");
const settingsLink = document.getElementById("settings-link");

// ─── Init ─────────────────────────────────────────────────────────────────────

chrome.storage.sync.get("token", ({ token }) => {
  if (token) {
    showStatusView(token);
  } else {
    showSetupView();
  }
});

// ─── Setup view ───────────────────────────────────────────────────────────────

function showSetupView() {
  setupView.style.display = "block";
  statusView.style.display = "none";
  settingsLink.style.display = "none";
  headerSub.textContent = "Not connected";
}

saveBtn.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) return;

  saveBtn.textContent = "Connecting…";
  saveBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/circuit-breaker/status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Invalid token");
    await chrome.storage.sync.set({ token });
    await chrome.runtime.sendMessage({ type: "POLL_NOW" });
    showStatusView(token);
  } catch {
    saveBtn.textContent = "Connect";
    saveBtn.disabled = false;
    tokenInput.style.borderColor = "#FF3B5C";
    setTimeout(() => { tokenInput.style.borderColor = ""; }, 2000);
  }
});

// ─── Status view ──────────────────────────────────────────────────────────────

function showStatusView(token) {
  setupView.style.display = "none";
  statusView.style.display = "block";
  settingsLink.style.display = "block";
  headerSub.textContent = `Token: …${token.slice(-8)}`;

  chrome.storage.local.get(["status", "lastPoll"], ({ status, lastPoll }) => {
    renderStatus(status);
    renderLastPoll(lastPoll);
  });
}

function renderStatus(status) {
  if (!status) {
    statusDot.className = "status-dot";
    document.getElementById("verdict-badge").className = "verdict-badge";
    document.getElementById("verdict-text").textContent = "—";
    return;
  }

  const { blocked, tradeCount, effectiveLimit, verdict, remaining } = status;

  // Dot
  statusDot.className = blocked ? "status-dot blocked" : "status-dot active";

  // Verdict badge
  const badge = document.getElementById("verdict-badge");
  const vClass = verdict === "GO" ? "go" : verdict === "CAUTION" ? "caution" : "no-trade";
  badge.className = `verdict-badge ${blocked ? "blocked" : vClass}`;
  document.getElementById("verdict-text").textContent = blocked ? "BLOCKED" : verdict;

  // Progress
  const pct = effectiveLimit > 0 ? Math.min(100, (tradeCount / effectiveLimit) * 100) : 100;
  const fillColor = blocked ? "#FF3B5C" : pct >= 80 ? "#FFB547" : "#00E87A";
  document.getElementById("trade-count-text").textContent = `${tradeCount} / ${effectiveLimit}`;
  const fill = document.getElementById("progress-fill");
  fill.style.width = `${pct}%`;
  fill.style.background = fillColor;

  // Stats
  document.getElementById("stat-done").textContent = tradeCount;
  document.getElementById("stat-remaining").textContent = blocked ? "0" : remaining;
  document.getElementById("stat-limit").textContent = effectiveLimit;
  document.getElementById("stat-done").style.color = blocked ? "#FF3B5C" : "#E8F0FF";
  document.getElementById("stat-remaining").style.color = blocked ? "#FF3B5C" : remaining <= 1 ? "#FFB547" : "#00E87A";

  // Blocked banner
  document.getElementById("blocked-banner").style.display = blocked ? "block" : "none";
}

function renderLastPoll(ts) {
  if (!ts) { lastPollEl.textContent = "Never synced"; return; }
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) lastPollEl.textContent = `Updated ${diff}s ago`;
  else if (diff < 3600) lastPollEl.textContent = `Updated ${Math.floor(diff / 60)}m ago`;
  else lastPollEl.textContent = `Updated ${Math.floor(diff / 3600)}h ago`;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

refreshBtn.addEventListener("click", async () => {
  refreshBtn.textContent = "Refreshing…";
  refreshBtn.disabled = true;
  await chrome.runtime.sendMessage({ type: "POLL_NOW" });

  chrome.storage.local.get(["status", "lastPoll"], ({ status, lastPoll }) => {
    renderStatus(status);
    renderLastPoll(lastPoll);
    refreshBtn.textContent = "Refresh Status";
    refreshBtn.disabled = false;
  });
});

dashboardBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/dashboard` });
});

disconnectBtn.addEventListener("click", async () => {
  await chrome.storage.sync.remove("token");
  await chrome.storage.local.remove(["status", "lastPoll"]);
  showSetupView();
});

settingsLink.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/settings#circuit-breaker` });
});