// TradeMind Circuit Breaker — WebSocket Interceptor (MAIN world)
// Patches WebSocket.prototype.send to block order-placement messages
// when the circuit breaker is active.
//
// Runs in page context (world: "MAIN") so it can intercept the page's WS.
// Status is relayed from the content script via window.postMessage.

(function () {
  "use strict";

  let blocked = false;

  // ─── Order detection patterns ────────────────────────────────────────────────
  // Matches JSON payloads that indicate an order placement across major platforms.
  const ORDER_PATTERNS = [
    // Binance WebSocket API v3
    /"method"\s*:\s*"order\.place"/,
    /"method"\s*:\s*"order\.place-list"/,
    // Bybit WebSocket
    /"op"\s*:\s*"order\.create"/,
    /"op"\s*:\s*"order\.create-batch"/,
    /"op"\s*:\s*"order\.amend"/,
    // OKX WebSocket
    /"op"\s*:\s*"order"/,
    /"op"\s*:\s*"batch-orders"/,
    /"op"\s*:\s*"amend-order"/,
    // Kraken WS v2
    /"method"\s*:\s*"add_order"/,
    /"method"\s*:\s*"batch_add"/,
    /"method"\s*:\s*"amend_order"/,
    // Gate.io WebSocket (futures & spot order placement via WS API)
    /"channel"\s*:\s*"(futures|spot|options)\.orders".*"event"\s*:\s*"api"/,
    // Alpaca WebSocket order entry
    /"action"\s*:\s*"order".*"side"\s*:\s*"(buy|sell)"/,
    // Bitget WebSocket
    /"op"\s*:\s*"placeOrder"/,
    /"op"\s*:\s*"batchPlaceOrder"/,
    // Generic fallback patterns
    /"action"\s*:\s*"placeOrder"/i,
    /"action"\s*:\s*"place_order"/i,
    /"type"\s*:\s*"newOrder"/i,
    /"event"\s*:\s*"addOrder"/i,
  ];

  function isOrderMessage(data) {
    if (typeof data !== "string") return false;
    // Quick pre-check before running all regexes
    const lc = data.toLowerCase();
    if (!lc.includes("order") && !lc.includes("place") && !lc.includes("\"side\"")) return false;
    return ORDER_PATTERNS.some((re) => re.test(data));
  }

  // ─── Patch WebSocket.prototype.send ─────────────────────────────────────────
  const OriginalWebSocket = window.WebSocket;
  const originalSend = OriginalWebSocket.prototype.send;

  OriginalWebSocket.prototype.send = function (data) {
    if (blocked && isOrderMessage(data)) {
      console.warn("[TradeMind] WebSocket order message blocked — circuit breaker active.");
      // Dispatch a custom event so the page can optionally show feedback
      window.dispatchEvent(new CustomEvent("trademind-ws-blocked", { detail: { data } }));
      return; // drop the message
    }
    return originalSend.call(this, data);
  };

  // ─── Listen for status updates from content script ───────────────────────────
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.type === "TM_CB_STATUS") {
      blocked = !!event.data.blocked;
    }
  });
})();