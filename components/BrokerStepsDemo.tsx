"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Shared types ── */
type Step = {
  title: string;
  desc: string;
  visual: React.ReactNode;
};

/* ── Pulse keyframe (injected once) ── */
const STYLE = `
@keyframes tmPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(79,142,247,0.5)} 50%{opacity:0.85;box-shadow:0 0 0 6px rgba(79,142,247,0)} }
@keyframes tmPulseG { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,232,122,0.5)} 50%{opacity:0.85;box-shadow:0 0 0 6px rgba(0,232,122,0)} }
@keyframes tmPulseR { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,176,32,0.5)} 50%{opacity:0.85;box-shadow:0 0 0 6px rgba(255,176,32,0)} }
@keyframes tmSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes tmCursor { 0%,100%{transform:translate(0,0)} 30%{transform:translate(4px,2px)} 60%{transform:translate(-2px,4px)} }
`;

function highlight(color = "#4F8EF7") {
  const anim = color === "#00E87A" ? "tmPulseG" : color === "#FFB020" ? "tmPulseR" : "tmPulse";
  return { outline: `2px solid ${color}`, outlineOffset: 2, animation: `${anim} 1.4s ease infinite` };
}

/* ─────────────────────────────────────────────
   MT4 / MT5 MOCKUPS
───────────────────────────────────────────── */
const WindowChrome = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "#1A1D2E", borderRadius: 10, overflow: "hidden", border: "1px solid #2D3148" }}>
    <div style={{ background: "#252840", padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
      </div>
      <span style={{ fontSize: 11, color: "#7080A0" }}>{title}</span>
    </div>
    {children}
  </div>
);

const MT4Step1 = () => (
  <WindowChrome title="MetaTrader 4">
    <div style={{ background: "#1E2138", padding: "4px 12px", display: "flex", gap: 18, fontSize: 12, color: "#8090B0" }}>
      {["File", "View"].map(m => <span key={m}>{m}</span>)}
      <span style={{ ...highlight(), background: "#4F8EF720", color: "#4F8EF7", padding: "1px 8px", borderRadius: 4 }}>Tools ▾</span>
      <span>Window</span><span>Help</span>
    </div>
    <div style={{ height: 72, background: "#141628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#2D3A55", fontSize: 11 }}>Chart area</div>
    </div>
    <div style={{ background: "#1A1D2E", padding: "4px 12px", fontSize: 10, color: "#3D4F6A" }}>ICMarkets-Live01 | EURUSD | H1</div>
  </WindowChrome>
);

const MT4Step2 = () => (
  <WindowChrome title="MetaTrader 4">
    <div style={{ background: "#1E2138", padding: "4px 12px", display: "flex", gap: 18, fontSize: 12, color: "#8090B0", position: "relative" }}>
      <span>File</span><span>View</span>
      <span style={{ color: "#4F8EF7" }}>Tools ▾</span>
      <div style={{ position: "absolute", left: 108, top: "100%", background: "#252840", border: "1px solid #3D4F6A", borderRadius: 6, minWidth: 140, zIndex: 10 }}>
        {["New Order", "Quotes", ""].map((item, i) =>
          item ? <div key={i} style={{ padding: "7px 14px", fontSize: 12, color: "#8090B0" }}>{item}</div> : <div key={i} style={{ height: 1, background: "#2D3A55", margin: "2px 0" }} />
        )}
        <div style={{ padding: "7px 14px", fontSize: 12, ...highlight(), color: "#4F8EF7", background: "#4F8EF720" }}>Options...</div>
        <div style={{ padding: "7px 14px", fontSize: 12, color: "#8090B0" }}>History Center</div>
      </div>
    </div>
    <div style={{ height: 72, background: "#141628" }} />
  </WindowChrome>
);

const MT4Step3 = () => (
  <WindowChrome title="Options — MetaTrader 4">
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 12, borderBottom: "1px solid #2D3148", paddingBottom: 8 }}>
        {["Charts", "Objects", "Trade", "Expert Advisors"].map(t => (
          <div key={t} style={{ padding: "4px 10px", fontSize: 11, color: "#6070A0", borderRadius: "4px 4px 0 0" }}>{t}</div>
        ))}
        <div style={{ padding: "4px 10px", fontSize: 11, ...highlight(), color: "#4F8EF7", background: "#4F8EF718", borderRadius: "4px 4px 0 0" }}>Server</div>
      </div>
      <div style={{ height: 55, background: "#141628", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 11, color: "#3D4F6A" }}>Server settings</div>
      </div>
    </div>
  </WindowChrome>
);

const MT4Step4 = () => (
  <WindowChrome title="Options — Server tab">
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 10, borderBottom: "1px solid #2D3148", paddingBottom: 6 }}>
        <div style={{ padding: "4px 10px", fontSize: 11, color: "#6070A0" }}>Charts</div>
        <div style={{ padding: "4px 10px", fontSize: 11, color: "#4F8EF7", borderBottom: "2px solid #4F8EF7" }}>Server</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "#6070A0", marginBottom: 4 }}>Login (Account Number)</div>
        <div style={{ background: "#141628", border: "1px solid #2D3148", borderRadius: 5, padding: "6px 10px", fontSize: 12, color: "#E0E8FF", fontFamily: "monospace", ...highlight() }}>
          12345678
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "#6070A0", marginBottom: 4 }}>Password</div>
        <div style={{ background: "#141628", border: "1px solid #2D3148", borderRadius: 5, padding: "6px 10px", fontSize: 12, color: "#6070A0" }}>
          ••••••••••••
        </div>
      </div>
    </div>
  </WindowChrome>
);

const MT4Step5 = () => (
  <WindowChrome title="Options — Server tab">
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 10, borderBottom: "1px solid #2D3148", paddingBottom: 6 }}>
        <div style={{ padding: "4px 10px", fontSize: 11, color: "#4F8EF7", borderBottom: "2px solid #4F8EF7" }}>Server</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "#6070A0", marginBottom: 4 }}>Login (Account Number)</div>
        <div style={{ background: "#141628", border: "1px solid #2D3148", borderRadius: 5, padding: "6px 10px", fontSize: 12, color: "#E0E8FF", fontFamily: "monospace" }}>12345678</div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "#6070A0", marginBottom: 4 }}>Investor Password (read-only)</div>
        <div style={{ background: "#141628", border: "1px solid #2D3148", borderRadius: 5, padding: "6px 10px", fontSize: 12, color: "#00E87A", fontFamily: "monospace", ...highlight("#00E87A") }}>
          investor_pw_here
        </div>
      </div>
    </div>
  </WindowChrome>
);

const MT4Step6 = () => (
  <WindowChrome title="MetaTrader 4">
    <div style={{ background: "#1E2138", padding: "4px 12px", fontSize: 12, color: "#8090B0", display: "flex", gap: 18 }}>
      <span>File</span><span>View</span><span>Tools</span><span>Help</span>
    </div>
    <div style={{ height: 60, background: "#141628" }} />
    <div style={{ background: "#1A1D2E", padding: "5px 12px", display: "flex", gap: 16, fontSize: 10, color: "#3D4F6A", alignItems: "center" }}>
      <span>Ready</span>
      <span style={{ flex: 1 }}>EURUSD H1</span>
      <span style={{ ...highlight(), color: "#4F8EF7", background: "#4F8EF720", padding: "1px 6px", borderRadius: 3, fontSize: 10 }}>FTMO-Server3</span>
    </div>
  </WindowChrome>
);

/* ─────────────────────────────────────────────
   TOPSTEPX MOCKUPS
───────────────────────────────────────────── */
const TSXStep1 = () => (
  <WindowChrome title="TopstepX — Dashboard">
    <div style={{ background: "#0F2617", padding: "8px 16px", display: "flex", alignItems: "center", gap: 20 }}>
      <span style={{ color: "#00C896", fontWeight: 700, fontSize: 13 }}>TopstepX</span>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#4D8070" }}>
        <span>Dashboard</span><span>Performance</span><span>Funding</span>
        <span style={{ ...highlight("#00C896"), color: "#00C896", background: "#00C89620", padding: "1px 8px", borderRadius: 4 }}>Settings</span>
      </div>
    </div>
    <div style={{ height: 72, background: "#0A1F12", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#1D3828", fontSize: 11 }}>Account overview</div>
    </div>
  </WindowChrome>
);

const TSXStep2 = () => (
  <WindowChrome title="TopstepX — Settings">
    <div style={{ background: "#0F2617", padding: "8px 16px", display: "flex", gap: 20, fontSize: 12 }}>
      <span style={{ color: "#00C896", fontWeight: 700, fontSize: 13 }}>TopstepX</span>
      <span style={{ color: "#00C896" }}>Settings</span>
    </div>
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["Profile", "Notifications"].map(t => (
          <div key={t} style={{ padding: "5px 12px", fontSize: 11, color: "#4D8070", borderRadius: 6, background: "#0A1F12" }}>{t}</div>
        ))}
        <div style={{ padding: "5px 12px", fontSize: 11, ...highlight("#00C896"), color: "#00C896", background: "#00C89620", borderRadius: 6 }}>API</div>
      </div>
      <div style={{ height: 45, background: "#0A1F12", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 11, color: "#1D3828" }}>API Keys section</div>
      </div>
    </div>
  </WindowChrome>
);

const TSXStep3 = () => (
  <WindowChrome title="TopstepX — API Keys">
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "#4D8070", marginBottom: 10 }}>API Keys</div>
      <div style={{ background: "#0A1F12", border: "1px solid #1D3828", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#1D3828", marginBottom: 6 }}>No API keys yet</div>
        <div style={{ ...highlight("#00C896"), display: "inline-block", background: "#00C89620", color: "#00C896", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 6, cursor: "pointer" }}>
          + Generate API Key
        </div>
      </div>
    </div>
  </WindowChrome>
);

const TSXStep4 = () => (
  <WindowChrome title="TopstepX — API Key Created">
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "#00C896", marginBottom: 10 }}>✓ API Key Generated</div>
      <div style={{ background: "#0A1F12", border: "1px solid #00C89640", borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 10, color: "#4D8070", marginBottom: 4 }}>Your API Key (copy this now)</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, background: "#0F2617", border: "1px solid #1D3828", borderRadius: 5, padding: "6px 10px", fontSize: 11, color: "#00C896", fontFamily: "monospace", ...highlight("#00C896") }}>
            tsx_live_xxxxxxxxxx...
          </div>
          <div style={{ background: "#00C896", color: "#0A1F12", fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 5, cursor: "pointer" }}>Copy</div>
        </div>
        <div style={{ fontSize: 10, color: "#4D8070", marginTop: 8 }}>Paste this into TradeMind&apos;s API Key field</div>
      </div>
    </div>
  </WindowChrome>
);

/* ─────────────────────────────────────────────
   TRADOVATE CSV MOCKUPS
───────────────────────────────────────────── */
const TRDStep1 = () => (
  <WindowChrome title="Tradovate — Platform">
    <div style={{ background: "#0D1525", padding: "8px 16px", display: "flex", alignItems: "center", gap: 20 }}>
      <span style={{ color: "#4F8EF7", fontWeight: 700, fontSize: 13 }}>Tradovate</span>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#3D4F6A" }}>
        <span>Trading</span>
        <span style={{ ...highlight(), color: "#4F8EF7", background: "#4F8EF720", padding: "1px 8px", borderRadius: 4 }}>Performance</span>
        <span>Charts</span>
      </div>
    </div>
    <div style={{ height: 72, background: "#080F1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#1A2440", fontSize: 11 }}>Trading dashboard</div>
    </div>
  </WindowChrome>
);

const TRDStep2 = () => (
  <WindowChrome title="Tradovate — Performance">
    <div style={{ background: "#0D1525", padding: "8px 16px", display: "flex", gap: 20 }}>
      <span style={{ color: "#4F8EF7", fontWeight: 700, fontSize: 13 }}>Performance</span>
    </div>
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["Summary", "P&L"].map(t => (
          <div key={t} style={{ padding: "5px 12px", fontSize: 11, color: "#3D4F6A", borderRadius: 6, background: "#080F1E" }}>{t}</div>
        ))}
        <div style={{ padding: "5px 12px", fontSize: 11, ...highlight(), color: "#4F8EF7", background: "#4F8EF720", borderRadius: 6 }}>Trade History</div>
      </div>
      <div style={{ height: 50, background: "#080F1E", borderRadius: 6, marginTop: 10 }} />
    </div>
  </WindowChrome>
);

const TRDStep3 = () => (
  <WindowChrome title="Tradovate — Trade History">
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <div style={{ background: "#080F1E", border: "1px solid #1A2440", borderRadius: 5, padding: "5px 10px", fontSize: 11, color: "#3D4F6A" }}>From: 01/01/2024</div>
        <div style={{ background: "#080F1E", border: "1px solid #1A2440", borderRadius: 5, padding: "5px 10px", fontSize: 11, color: "#3D4F6A" }}>To: Today</div>
        <div style={{ flex: 1 }} />
        <div style={{ ...highlight(), background: "#4F8EF720", color: "#4F8EF7", fontSize: 14, padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}>⬇</div>
      </div>
      <div style={{ background: "#080F1E", borderRadius: 6, overflow: "hidden" }}>
        {[["NQ", "+$420"], ["ES", "-$80"], ["NQ", "+$215"]].map(([sym, pnl], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: i < 2 ? "1px solid #1A2440" : undefined, fontSize: 11 }}>
            <span style={{ color: "#6070A0" }}>{sym}</span>
            <span style={{ color: pnl.startsWith("+") ? "#00E87A" : "#FF3B5C" }}>{pnl}</span>
          </div>
        ))}
      </div>
    </div>
  </WindowChrome>
);

const TRDStep4 = () => (
  <WindowChrome title="Tradovate — CSV Downloaded">
    <div style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 24 }}>📄</div>
      <div style={{ fontSize: 12, color: "#4F8EF7", fontWeight: 600 }}>trades_export.csv</div>
      <div style={{ fontSize: 11, color: "#3D4F6A" }}>Downloaded to your computer</div>
      <div style={{ width: "100%", padding: "14px 0", borderRadius: 8, border: "2px dashed #2D3A55", textAlign: "center", fontSize: 11, color: "#3D4F6A", ...highlight() }}>
        ↑ Now drag this file to TradeMind
      </div>
    </div>
  </WindowChrome>
);

/* ─────────────────────────────────────────────
   STEP PLAYER
───────────────────────────────────────────── */
function StepPlayer({ steps, color = "#4F8EF7" }: { steps: Step[]; color?: string }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(advance, 3200);
    return () => clearTimeout(id);
  }, [current, paused, advance]);

  const step = steps[current];

  return (
    <div>
      <style>{STYLE}</style>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => { setCurrent(i); setPaused(true); }} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= current ? color : "#2D3A55", cursor: "pointer", transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Visual — animate on change */}
      <div key={current} style={{ animation: "tmSlideIn 0.3s ease", marginBottom: 14 }}>
        {step.visual}
      </div>

      {/* Label */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginTop: 1 }}>
          {current + 1}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{step.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7 }}>{step.desc}</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => { setCurrent(c => Math.max(0, c - 1)); setPaused(true); }}
          disabled={current === 0}
          style={{ flex: 1, padding: "8px 0", fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", cursor: current === 0 ? "default" : "pointer", opacity: current === 0 ? 0.35 : 1, color: "var(--text-dim)" }}>
          ← Back
        </button>
        <button
          onClick={() => { setPaused(p => !p); }}
          style={{ padding: "8px 14px", fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", color: "var(--text-muted)" }}>
          {paused ? "▶" : "⏸"}
        </button>
        <button
          onClick={() => { if (current < steps.length - 1) { setCurrent(c => c + 1); setPaused(true); } else { setCurrent(0); setPaused(false); } }}
          style={{ flex: 1, padding: "8px 0", fontSize: 12, borderRadius: 8, border: "none", background: color, cursor: "pointer", color: color === "#00C896" ? "#040F08" : "white", fontWeight: 600 }}>
          {current < steps.length - 1 ? "Next →" : "Replay ↺"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIDEO URLS — paste your Loom / YouTube / MP4 URLs here when ready
   Leave as empty string "" to show the animated mockup instead
───────────────────────────────────────────── */
const VIDEO_URLS = {
  mt4:       "",   // e.g. "https://www.loom.com/share/abc123"
  topstepx:  "",   // e.g. "https://youtu.be/xyz"
  tradovate: "",   // e.g. "https://trademindedge.com/videos/tradovate.mp4"
};

/* ─────────────────────────────────────────────
   VIDEO PLAYER — auto-detects Loom / YouTube / direct file
───────────────────────────────────────────── */
function embedUrl(url: string): string {
  if (url.includes("loom.com/share/")) {
    const id = url.split("loom.com/share/")[1].split("?")[0];
    return `https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  }
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v") ?? "";
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  }
  return url;
}

function isDirectVideo(url: string) {
  return url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov");
}

function VideoPlayer({ url, label }: { url: string; label: string }) {
  const direct = isDirectVideo(url);
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", background: "#0A0C15", position: "relative", paddingBottom: "56.25%", height: 0 }}>
      {direct ? (
        <video
          src={url}
          controls
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 10 }}
          aria-label={label}
        />
      ) : (
        <iframe
          src={embedUrl(url)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={label}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEXT GUIDE — shared building block
───────────────────────────────────────────── */
type GuideStep = { text: React.ReactNode; note?: React.ReactNode };

function Guide({ steps, color = "#4F8EF7" }: { steps: GuideStep[]; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{s.text}</div>
            {s.note && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${color}30` }}>{s.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <strong style={{ color: "var(--text)", fontWeight: 700 }}>{children}</strong>;
const Path = ({ children }: { children: React.ReactNode }) => <span style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 4, padding: "1px 6px", fontSize: 12, fontFamily: "monospace", color: "var(--blue)" }}>{children}</span>;

/* ─────────────────────────────────────────────
   EXPORTED DEMOS
───────────────────────────────────────────── */
export function MT4Demo() {
  if (VIDEO_URLS.mt4) return <VideoPlayer url={VIDEO_URLS.mt4} label="How to connect MT4/MT5 to TradeMind" />;
  return (
    <Guide color="#FF6B35" steps={[
      {
        text: <>פתח את <B>MetaTrader 4</B> או <B>MetaTrader 5</B> במחשב — הפלטפורמה שאתה סוחר בה (FTMO, IC Markets, FxFlat וכו&apos;).</>,
      },
      {
        text: <>בשורת התפריט העליונה, לחץ <Path>Tools</Path> → <Path>Options</Path>.</>,
      },
      {
        text: <>בחלון Options שנפתח, לחץ על הלשונית <B>Server</B>.</>,
      },
      {
        text: <>מספר החשבון שלך (<B>Account Number</B>) מופיע בשדה Login — למשל <Path>12345678</Path>. העתק אותו.</>,
      },
      {
        text: <>חפש את שדה <B>Investor Password</B> — זו הסיסמה לקריאה בלבד, לא הסיסמה הרגילה שאתה מתחבר איתה.</>,
        note: <>אם השדה ריק: לחץ לחיצה ימנית על שם החשבון בפאנל Navigator (שמאל) → <Path>Change Password</Path> → עבור ללשונית <B>Investor</B> → הגדר סיסמה חדשה.</>,
      },
      {
        text: <>שם ה<B>Server</B> מופיע בפינה הימנית התחתונה של MT4/MT5 — למשל <Path>FTMO-Server3</Path> או <Path>ICMarkets-Live01</Path>.</>,
        note: <>FTMO: בדרך כלל FTMO-Server2 או FTMO-Server3. IC Markets: ICMarkets-Live01. ברוקרים אחרים: בדוק באתר הברוקר.</>,
      },
    ]} />
  );
}

export function TopstepXDemo() {
  if (VIDEO_URLS.topstepx) return <VideoPlayer url={VIDEO_URLS.topstepx} label="How to connect TopstepX to TradeMind" />;
  return (
    <Guide color="#00C896" steps={[
      {
        text: <>התחבר לחשבון TopstepX שלך בכתובת <B>topstepx.com</B>.</>,
      },
      {
        text: <>לחץ על אייקון הפרופיל שלך בפינה הימנית העליונה → <Path>Settings</Path>.</>,
      },
      {
        text: <>בתוך Settings, עבור ללשונית <B>API</B>.</>,
      },
      {
        text: <>לחץ על <B>Generate API Key</B> — המפתח ייווצר מיידית.</>,
        note: <>שמור את המפתח מיד — הוא מוצג פעם אחת בלבד. אם תסגור את הדף לפני שהעתקת, יהיה צורך לייצר מפתח חדש.</>,
      },
      {
        text: <>חזור לכאן: הדבק את <B>ה-Username</B> שלך (כתובת המייל שלך ב-TopstepX) בשדה Username, ואת המפתח שהעתקת בשדה API Key.</>,
      },
    ]} />
  );
}

export function TradovateDemo() {
  if (VIDEO_URLS.tradovate) return <VideoPlayer url={VIDEO_URLS.tradovate} label="How to export trades from Tradovate" />;
  return (
    <Guide color="#4F8EF7" steps={[
      {
        text: <>פתח את פלטפורמת המסחר שלך — <B>Tradovate</B>, או כל פלטפורמה של חברת prop שמבוססת על Tradovate (<B>Apex Trader Funding</B>, <B>Funded Next</B>, <B>Lucid Trading</B>, <B>TopStep</B> חוזים עתידיים).</>,
      },
      {
        text: <>בתפריט העליון, לחץ על <Path>Performance</Path>.</>,
      },
      {
        text: <>בתוך Performance, לחץ על הלשונית <B>Trade History</B>.</>,
      },
      {
        text: <>הגדר את <B>טווח התאריכים</B> שאתה רוצה לייבא — לדוגמה: מ-90 יום אחורה ועד היום.</>,
      },
      {
        text: <>לחץ על כפתור <B>⬇ Download</B> בצד ימין — קובץ CSV יורד למחשב שלך.</>,
        note: <>הקובץ יישמר בתיקיית Downloads של המחשב בשם כמו trade_history.csv.</>,
      },
      {
        text: <>חזור לכאן וגרור את הקובץ לאזור ההעלאה, או לחץ עליו לבחירה ידנית. TradeMind יייבא את כל העסקאות אוטומטית.</>,
      },
    ]} />
  );
}

export function BinanceGuide() {
  return (
    <Guide color="#F0B90B" steps={[
      { text: <>התחבר ל-<B>Binance</B> → hover על אייקון הפרופיל → <Path>API Management</Path>.</> },
      { text: <>לחץ <B>Create API</B> → בחר <B>System Generated</B> → תן שם (למשל "TradeMind") → לחץ <B>Next</B>.</> },
      { text: <>השלם את אימות הזהות (קוד SMS / Email / Authenticator).</> },
      {
        text: <><B>API Key</B> ו-<B>Secret Key</B> יופיעו — העתק את שניהם עכשיו.</>,
        note: <>ה-Secret Key מוצג פעם אחת בלבד. אם סגרת לפני שהעתקת — מחק ויצר מחדש.</>,
      },
      {
        text: <>וודא שמופעלת רק ההרשאה <B>Read Info / Enable Reading</B>. אל תסמן Trading, Withdrawals או כל הרשאה אחרת.</>,
      },
      { text: <>חזור לכאן: הדבק את ה-API Key ואת ה-Secret Key בשדות המתאימים.</> },
    ]} />
  );
}

export function BybitGuide() {
  return (
    <Guide color="#F7A600" steps={[
      { text: <>התחבר ל-<B>Bybit</B> → לחץ על אייקון הפרופיל בפינה הימנית העליונה → <Path>API</Path>.</> },
      { text: <>לחץ <B>Create New Key</B> → בחר <B>API Transaction</B> (לא Third-Party).</> },
      { text: <>הגדר שם (למשל "TradeMind"), וודא שבחרת <B>Read-Only</B> בלבד → לחץ <B>Submit</B>.</> },
      {
        text: <><B>API Key</B> ו-<B>API Secret</B> יופיעו — העתק את שניהם.</>,
        note: <>ה-Secret מוצג פעם אחת בלבד. אם סגרת לפני שהעתקת — מחק ויצר מחדש.</>,
      },
      { text: <>חזור לכאן: הדבק API Key ו-API Secret בשדות המתאימים.</> },
    ]} />
  );
}

export function CoinbaseGuide() {
  return (
    <Guide color="#0052FF" steps={[
      { text: <>התחבר ל-<B>Coinbase Advanced Trade</B> (coinbase.com/advanced-trade).</> },
      { text: <>לחץ על פרופיל → <Path>Settings</Path> → לשונית <B>API</B>.</> },
      { text: <>לחץ <B>New API Key</B>. בחר את החשבון (Portfolio) שאתה רוצה לחבר.</> },
      {
        text: <>תחת Permissions, סמן <B>View</B> בלבד (אל תסמן Trade, Transfer).</>,
      },
      {
        text: <><B>API Key</B> ו-<B>Private Key</B> יופיעו. העתק את שניהם.</>,
        note: <>ה-Private Key הוא מחרוזת ארוכה שמתחילה ב-EC. שמור אותו — הוא מוצג פעם אחת.</>,
      },
      { text: <>חזור לכאן: הדבק את ה-API Key ואת ה-Private Key בשדות המתאימים.</> },
    ]} />
  );
}

export function KrakenGuide() {
  return (
    <Guide color="#5741D9" steps={[
      { text: <>התחבר ל-<B>Kraken</B> → לחץ על שם המשתמש בפינה הימנית → <Path>Security</Path> → <Path>API</Path>.</> },
      { text: <>לחץ <B>Create API key</B>. תן שם (למשל "TradeMind").</> },
      {
        text: <>תחת Permissions, סמן <B>Query Funds</B> ו-<B>Query Open Orders & Trades</B> בלבד. אל תסמן Create/Modify/Cancel Orders.</>,
      },
      { text: <>לחץ <B>Generate Key</B>. ה-<B>API Key</B> וה-<B>Private Key</B> יופיעו — העתק את שניהם.</> },
      { text: <>חזור לכאן: הדבק API Key ו-Private Key בשדות המתאימים.</> },
    ]} />
  );
}

export function AlpacaGuide() {
  return (
    <Guide color="#00E87A" steps={[
      { text: <>התחבר ל-<B>Alpaca</B> (app.alpaca.markets). בחר את סוג החשבון: Live או Paper.</> },
      {
        text: <>בתפריט השמאלי, לחץ <Path>Overview</Path> → גלול למטה לקטע <B>Your API Keys</B> → לחץ <B>View</B>.</>,
        note: <>אם עדיין אין לך מפתח: לחץ Generate New Key.</>,
      },
      { text: <><B>API Key ID</B> ו-<B>Secret Key</B> יופיעו — העתק את שניהם.</> },
      { text: <>חזור לכאן: בחר Live או Paper בהתאם לחשבון שלך, והדבק את המפתחות.</> },
    ]} />
  );
}