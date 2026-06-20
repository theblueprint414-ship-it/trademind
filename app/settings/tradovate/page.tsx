"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { TradovateDemo } from "@/components/BrokerStepsDemo";

const TV_COLOR = "#5e6ad2";
const TV_BG    = "rgba(94,106,210,0.08)";
const TV_BD    = "rgba(94,106,210,0.25)";

export default function TradovateSettingsPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/broker/csv-import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Import failed. Try the column mapper in Journal → Import CSV.");
      } else {
        setResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 });
      }
    } catch {
      setError("Upload failed. Please try again.");
    }
    setUploading(false);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tv-fade { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Header */}
      <div className="app-header">
        <Link href="/settings">
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Settings</button>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: TV_BG, border: `1px solid ${TV_BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: TV_COLOR, letterSpacing: "0.05em" }}>TRD</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Tradovate</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 100px" }}>
        <div className="tv-fade">

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: TV_BG, border: `1px solid ${TV_BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: TV_COLOR, letterSpacing: "0.05em", margin: "0 auto 14px" }}>TRD</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>Import Your Tradovate Trades</h1>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              Tradovate doesn&apos;t offer self-serve live API access for retail and prop accounts, so the fastest reliable path
              is a CSV export — it takes about 30 seconds and we auto-detect every column.
            </p>
          </div>

          {/* Account type info */}
          <div style={{ padding: "14px 16px", borderRadius: 10, background: TV_BG, border: `1px solid ${TV_BD}`, marginBottom: 24, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: TV_COLOR, marginBottom: 6, fontSize: 12, letterSpacing: "0.06em" }}>WORKS WITH</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Apex Trader Funding",
                "Funded Next",
                "Lucid Trading",
                "TopStep (via Tradovate)",
                "Personal Tradovate accounts",
              ].map((firm) => (
                <div key={firm} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={TV_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {firm}
                </div>
              ))}
            </div>
          </div>

          {/* Guide + upload */}
          <div className="card" style={{ padding: 22, marginBottom: 16, border: `1px solid ${TV_BD}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>HOW TO EXPORT FROM TRADOVATE</div>
            <TradovateDemo />

            {result ? (
              <>
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", color: "var(--green)", fontSize: 13, textAlign: "center", marginTop: 16, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {result.imported} trade{result.imported !== 1 ? "s" : ""} imported{result.skipped > 0 ? ` · ${result.skipped} duplicates skipped` : ""}
                </div>
                <Link href="/journal">
                  <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}>View Journal →</button>
                </Link>
              </>
            ) : (
              <>
                <label style={{ display: "block", marginTop: 16, padding: "24px 18px", borderRadius: 10, border: "2px dashed var(--border)", textAlign: "center", cursor: uploading ? "wait" : "pointer", background: "var(--surface2)", transition: "border-color 0.15s" }}>
                  <input type="file" accept=".csv" style={{ display: "none" }} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: "var(--text-dim)" }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v14M10 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 20v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {uploading ? "Importing..." : "Upload Tradovate CSV"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click or drag your export here · free, no plan required</div>
                </label>

                {error && (
                  <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", fontSize: 13, color: "var(--red)", lineHeight: 1.6 }}>
                    {error} Need help mapping unusual columns? <Link href="/journal" style={{ color: "var(--red)", fontWeight: 700 }}>Use the column mapper in Journal →</Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Other broker options */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Using a different platform? </span>
            <Link href="/onboarding" style={{ fontSize: 12, color: TV_COLOR, fontWeight: 700 }}>Connect another broker →</Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
