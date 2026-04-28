"use client";

import { useState } from "react";
import Link from "next/link";

const TOPICS = [
  { value: "billing", label: "Billing & subscription" },
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "account", label: "Account & data" },
  { value: "other", label: "Something else" },
];

export default function ContactPage() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[TradeMind] ${TOPICS.find((t) => t.value === topic)?.label ?? topic}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:support@trademindedge.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none" }}>← Back to TradeMind</Link>

        <div style={{ marginTop: 32, marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Contact Support</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7 }}>
            We typically respond within a few hours. For billing issues, have your email address ready.
          </p>
        </div>

        {/* Quick answers */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 16 }}>COMMON ANSWERS</div>
          {[
            { q: "How do I cancel?", a: "Settings → Billing → Cancel plan. You keep access until the end of your paid period." },
            { q: "How do I request a refund?", a: "We offer a 7-day free trial — no refunds after a payment processes. See our Refund Policy for details.", link: "/refund" },
            { q: "How do I delete my account?", a: "Settings → Account → Delete account. All your data is permanently removed." },
            { q: "How do I unsubscribe from emails?", a: "Click the unsubscribe link at the bottom of any TradeMind email, or go to Settings → Notifications." },
          ].map((item) => (
            <div key={item.q} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{item.q}</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                {item.a}{" "}
                {item.link && <Link href={item.link} style={{ color: "var(--blue)", textDecoration: "none" }}>Learn more →</Link>}
              </p>
            </div>
          ))}
          <div style={{ paddingBottom: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>How do I export my data?</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>Settings → Account → Export data. Downloads a JSON file with all your check-ins, trades, and journal entries.</p>
          </div>
        </div>

        {/* Contact form */}
        {sent ? (
          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 14, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email client opened</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
              Your message is pre-filled — just hit send. If your email client didn&apos;t open,{" "}
              <a href="mailto:support@trademindedge.com" style={{ color: "var(--blue)", textDecoration: "none" }}>email us directly</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>TOPIC</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: topic ? "var(--text)" : "var(--text-muted)", fontSize: 14, outline: "none" }}
              >
                <option value="" disabled>Select a topic…</option>
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", display: "block", marginBottom: 8 }}>MESSAGE</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Describe your issue or question in detail…"
                rows={5}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "14px 0", fontSize: 15, borderRadius: 10 }}
            >
              Send Message →
            </button>

            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              Or email us directly at{" "}
              <a href="mailto:support@trademindedge.com" style={{ color: "var(--blue)", textDecoration: "none" }}>support@trademindedge.com</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}