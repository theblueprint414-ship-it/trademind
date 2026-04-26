export default function RefundPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <a href="/" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none" }}>← Back to TradeMind</a>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "32px 0 8px" }}>Refund Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>Last updated: April 2026</p>

        {[
          {
            title: "4-Day Free Trial",
            body: "TradeMind paid plans include a 4-day free trial. You will not be charged during the trial period. Cancel any time before day 5 and you will never be billed."
          },
          {
            title: "No Refunds Policy",
            body: "All payments are final and non-refundable. Because we offer a free trial before any charge, we do not issue refunds after a payment has been processed. We encourage you to use the trial period to evaluate TradeMind before subscribing."
          },
          {
            title: "How to Cancel",
            body: "You can cancel your subscription at any time from your Paddle billing portal. After cancellation, you will retain Pro access until the end of your paid period, then revert to the free plan. No future charges will apply."
          },
          {
            title: "Contact",
            body: "Questions about billing: support@trademindedge.com"
          },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
