// TradeMind Circuit Breaker — Content Script
// Injects a full-page block overlay when the trade limit is active.

(function () {
  "use strict";

  let overlayEl = null;

  // ─── Init ──────────────────────────────────────────────────────────────────

  // Load cached status immediately on page load
  chrome.storage.local.get("status", ({ status }) => {
    if (status) applyStatus(status);
  });

  // Listen for real-time updates from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "STATUS_UPDATE" && msg.status) {
      applyStatus(msg.status);
    }
  });

  // ─── Core logic ───────────────────────────────────────────────────────────

  function applyStatus(status) {
    // Relay blocked state to ws-intercept.js running in page context
    window.postMessage({ type: "TM_CB_STATUS", blocked: status.blocked }, "*");
    if (status.blocked) {
      showOverlay(status);
    } else {
      removeOverlay();
    }
  }

  function showOverlay(status) {
    if (overlayEl) return; // already shown

    overlayEl = document.createElement("div");
    overlayEl.id = "trademind-cb-overlay";
    overlayEl.innerHTML = buildOverlayHTML(status);
    overlayEl.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483647",
      "background:rgba(7,11,20,0.97)",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "justify-content:center",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "color:#E8F0FF",
      "text-align:center",
      "padding:32px",
    ].join(";");

    document.documentElement.appendChild(overlayEl);

    // Block scroll on the page behind
    document.body.style.overflow = "hidden";

    // Wire up emergency override button
    document.getElementById("tm-override-btn")?.addEventListener("click", handleOverride);
    document.getElementById("tm-dashboard-btn")?.addEventListener("click", () => {
      window.open("https://trademindedge.com/dashboard", "_blank");
    });
  }

  function removeOverlay() {
    if (!overlayEl) return;
    overlayEl.remove();
    overlayEl = null;
    document.body.style.overflow = "";
  }

  function handleOverride() {
    const btn = document.getElementById("tm-override-btn");
    const confirmEl = document.getElementById("tm-override-confirm");

    if (!confirmEl.classList.contains("visible")) {
      confirmEl.classList.add("visible");
      confirmEl.style.display = "block";
      btn.textContent = "Yes, override (I accept the risk)";
      btn.style.background = "#FF3B5C";
      btn.dataset.confirmed = "1";
      return;
    }

    if (btn.dataset.confirmed === "1") {
      chrome.storage.session.set({ overrideUntil: Date.now() + 3600000 });
      // Audit log — fire-and-forget, don't block overlay removal
      chrome.storage.sync.get("token", ({ token }) => {
        if (token) {
          fetch(`https://trademindedge.com/api/circuit-breaker/override?token=${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }).catch(() => {});
        }
      });
      removeOverlay();
    }
  }

  function buildOverlayHTML(status) {
    const verdictColor = status.verdict === "GO" ? "#00E87A" : status.verdict === "CAUTION" ? "#FFB547" : "#FF3B5C";
    const limitMsg = status.scoreAdaptive && status.verdict !== "GO"
      ? `Limit reduced to <strong>${status.effectiveLimit}</strong> (${status.verdict} day)`
      : `Daily limit: <strong>${status.dailyLimit}</strong> trades`;

    const host = window.location.hostname;
    const isNetworkOnlyBroker = host.includes("binance") || host.includes("bybit") ||
      host.includes("okx") || host.includes("kraken") || host.includes("gate.io") ||
      host.includes("mexc") || host.includes("bitget");
    const brokerWarning = isNetworkOnlyBroker
      ? `<div id="tm-broker-note">Network blocking active on this platform — keep TradeMind extension enabled for full protection.</div>`
      : "";

    return `
      <style>
        #trademind-cb-overlay * { box-sizing: border-box; margin: 0; padding: 0; }
        #tm-logo { width: 56px; height: 56px; background: #0D1420; border: 1px solid #1E2D45; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; }
        #tm-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px; }
        #tm-sub { font-size: 15px; color: #3D4F6A; line-height: 1.7; max-width: 360px; margin: 0 auto 32px; }
        .tm-stat-row { display: flex; gap: 16px; margin-bottom: 32px; justify-content: center; }
        .tm-stat { background: #0D1420; border: 1px solid #1E2D45; border-radius: 12px; padding: 14px 22px; min-width: 110px; }
        .tm-stat-val { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
        .tm-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #3D4F6A; text-transform: uppercase; }
        .tm-verdict { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; padding: 4px 12px; border-radius: 20px; margin-bottom: 32px; background: rgba(255,59,92,0.12); color: #FF3B5C; border: 1px solid rgba(255,59,92,0.3); }
        .tm-btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .tm-btn { font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; transition: opacity 0.15s; }
        .tm-btn:hover { opacity: 0.85; }
        .tm-btn-primary { background: #4F8EF7; color: #fff; }
        .tm-btn-ghost { background: transparent; color: #3D4F6A; border: 1px solid #1E2D45; }
        #tm-override-confirm { display: none; margin-top: 20px; font-size: 13px; color: #FF3B5C; max-width: 340px; line-height: 1.6; }
        #tm-override-confirm.visible { display: block; }
        #tm-limit-note { font-size: 13px; color: #3D4F6A; margin-top: 16px; }
        #tm-broker-note { margin-top: 14px; font-size: 11px; color: #2A3A52; background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.18); border-radius: 8px; padding: 8px 14px; max-width: 360px; }
      </style>

      <div id="tm-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 22l5.5-7 4.5 4.5 7-12.5 5 6.5" stroke="#4F8EF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 25h20" stroke="#4F8EF7" stroke-width="2" stroke-linecap="round"/>
          <circle cx="22" cy="6" r="5" fill="#070B14" stroke="#FF3B5C" stroke-width="1.8"/>
          <path d="M20.5 6h3M22 4.5v3" stroke="#FF3B5C" stroke-width="1.5" stroke-linecap="round" transform="rotate(45 22 6)"/>
        </svg>
      </div>

      <div id="tm-title">Circuit Breaker Active</div>
      <div id="tm-sub">You've reached your daily trade limit. Take a step back — your future self will thank you.</div>

      <div class="tm-stat-row">
        <div class="tm-stat">
          <div class="tm-stat-val" style="color:#FF3B5C">${status.tradeCount}</div>
          <div class="tm-stat-label">Trades Today</div>
        </div>
        <div class="tm-stat">
          <div class="tm-stat-val" style="color:#4F8EF7">${status.effectiveLimit}</div>
          <div class="tm-stat-label">Daily Limit</div>
        </div>
        <div class="tm-stat">
          <div class="tm-stat-val" style="color:${verdictColor}">${status.verdict}</div>
          <div class="tm-stat-label">Mental State</div>
        </div>
      </div>

      <div class="tm-btn-row">
        <button class="tm-btn tm-btn-primary" id="tm-dashboard-btn">View Dashboard</button>
        <button class="tm-btn tm-btn-ghost" id="tm-override-btn">Emergency Override</button>
      </div>

      <div id="tm-override-confirm">
        Warning: overriding your circuit breaker undermines your trading discipline. This override expires in 1 hour and will be visible in your TradeMind dashboard.
      </div>

      <div id="tm-limit-note">${limitMsg}</div>
      ${brokerWarning}
    `;
  }
})();