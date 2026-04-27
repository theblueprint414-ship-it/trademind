"use client";

/* ─────────────────────────────────────────────
   VIDEO URLS — paste your Loom / YouTube / MP4 URLs here when ready
   Leave as empty string "" to show the text guide instead
───────────────────────────────────────────── */
const VIDEO_URLS = {
  mt4:       "",
  topstepx:  "",
  tradovate: "",
};

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
        <video src={url} controls playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 10 }} aria-label={label} />
      ) : (
        <iframe src={embedUrl(url)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={label} />
      )}
    </div>
  );
}

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

export function MT4Demo() {
  if (VIDEO_URLS.mt4) return <VideoPlayer url={VIDEO_URLS.mt4} label="How to connect MT4/MT5 to TradeMind" />;
  return (
    <Guide color="#FF6B35" steps={[
      { text: <>Open <B>MetaTrader 4</B> or <B>MetaTrader 5</B> on your computer — the platform you trade on (FTMO, IC Markets, FxFlat, etc.).</> },
      { text: <>In the top menu bar, click <Path>Tools</Path> → <Path>Options</Path>.</> },
      { text: <>In the Options window, click the <B>Server</B> tab.</> },
      { text: <>Your account number appears in the Login field — e.g. <Path>12345678</Path>. Copy it.</> },
      {
        text: <>Find the <B>Investor Password</B> field — this is the read-only password, not your regular login password.</>,
        note: <>If empty: right-click your account name in the Navigator panel → <Path>Change Password</Path> → go to the <B>Investor</B> tab → set a new password.</>,
      },
      {
        text: <>The <B>Server</B> name appears in the bottom-right corner of MT4/MT5 — e.g. <Path>FTMO-Server3</Path> or <Path>ICMarkets-Live01</Path>.</>,
        note: <>FTMO: usually FTMO-Server2 or FTMO-Server3. IC Markets: ICMarkets-Live01. Other brokers: check your broker&apos;s website.</>,
      },
    ]} />
  );
}

export function TopstepXDemo() {
  if (VIDEO_URLS.topstepx) return <VideoPlayer url={VIDEO_URLS.topstepx} label="How to connect TopstepX to TradeMind" />;
  return (
    <Guide color="#00C896" steps={[
      { text: <>Log in to your TopstepX account at <B>topstepx.com</B>.</> },
      { text: <>Click your profile icon in the top-right corner → <Path>Settings</Path>.</> },
      { text: <>Inside Settings, go to the <B>API</B> tab.</> },
      {
        text: <>Click <B>Generate API Key</B> — the key is created instantly.</>,
        note: <>Save the key immediately — it is shown only once. If you close the page before copying, you will need to generate a new one.</>,
      },
      { text: <>Come back here: paste your <B>Username</B> (your TopstepX email) into the Username field, and the key into the API Key field.</> },
    ]} />
  );
}

export function TradovateDemo() {
  if (VIDEO_URLS.tradovate) return <VideoPlayer url={VIDEO_URLS.tradovate} label="How to export trades from Tradovate" />;
  return (
    <Guide color="#4F8EF7" steps={[
      { text: <>Open your trading platform — <B>Tradovate</B>, or any prop firm platform built on Tradovate (<B>Apex Trader Funding</B>, <B>Funded Next</B>, <B>Lucid Trading</B>, <B>TopStep</B> futures).</> },
      { text: <>In the top menu, click <Path>Performance</Path>.</> },
      { text: <>Inside Performance, click the <B>Trade History</B> tab.</> },
      { text: <>Set the <B>date range</B> you want to import — for example: 90 days back to today.</> },
      {
        text: <>Click the <B>⬇ Download</B> button on the right — a CSV file downloads to your computer.</>,
        note: <>The file saves to your Downloads folder with a name like trade_history.csv.</>,
      },
      { text: <>Come back here and drag the file into the upload area, or click to select it manually. TradeMind will import all trades automatically.</> },
    ]} />
  );
}

export function BinanceGuide() {
  return (
    <Guide color="#F0B90B" steps={[
      { text: <>Log in to <B>Binance</B> → hover over your profile icon → <Path>API Management</Path>.</> },
      { text: <>Click <B>Create API</B> → choose <B>System Generated</B> → give it a name (e.g. "TradeMind") → click <B>Next</B>.</> },
      { text: <>Complete identity verification (SMS / Email / Authenticator code).</> },
      {
        text: <>Your <B>API Key</B> and <B>Secret Key</B> will appear — copy both now.</>,
        note: <>The Secret Key is shown only once. If you closed before copying — delete and create a new one.</>,
      },
      { text: <>Make sure only <B>Read Info / Enable Reading</B> is enabled. Do not check Trading, Withdrawals, or any other permission.</> },
      { text: <>Come back here: paste the API Key and Secret Key into the matching fields.</> },
    ]} />
  );
}

export function BybitGuide() {
  return (
    <Guide color="#F7A600" steps={[
      { text: <>Log in to <B>Bybit</B> → click your profile icon in the top-right → <Path>API</Path>.</> },
      { text: <>Click <B>Create New Key</B> → choose <B>API Transaction</B> (not Third-Party).</> },
      { text: <>Set a name (e.g. "TradeMind"), select <B>Read-Only</B> only → click <B>Submit</B>.</> },
      {
        text: <>Your <B>API Key</B> and <B>API Secret</B> will appear — copy both.</>,
        note: <>The Secret is shown only once. If you closed before copying — delete and create a new one.</>,
      },
      { text: <>Come back here: paste the API Key and API Secret into the matching fields.</> },
    ]} />
  );
}

export function CoinbaseGuide() {
  return (
    <Guide color="#0052FF" steps={[
      { text: <>Log in to <B>Coinbase Advanced Trade</B> (coinbase.com/advanced-trade).</> },
      { text: <>Click your profile → <Path>Settings</Path> → <B>API</B> tab.</> },
      { text: <>Click <B>New API Key</B>. Select the account (Portfolio) you want to connect.</> },
      { text: <>Under Permissions, check <B>View</B> only (do not check Trade or Transfer).</> },
      {
        text: <>Your <B>API Key</B> and <B>Private Key</B> will appear. Copy both.</>,
        note: <>The Private Key is a long string starting with EC. Save it — it is shown only once.</>,
      },
      { text: <>Come back here: paste the API Key and Private Key into the matching fields.</> },
    ]} />
  );
}

export function KrakenGuide() {
  return (
    <Guide color="#5741D9" steps={[
      { text: <>Log in to <B>Kraken</B> → click your username in the top-right → <Path>Security</Path> → <Path>API</Path>.</> },
      { text: <>Click <B>Create API key</B>. Give it a name (e.g. "TradeMind").</> },
      { text: <>Under Permissions, check <B>Query Funds</B> and <B>Query Open Orders &amp; Trades</B> only. Do not check Create/Modify/Cancel Orders.</> },
      { text: <>Click <B>Generate Key</B>. Your <B>API Key</B> and <B>Private Key</B> will appear — copy both.</> },
      { text: <>Come back here: paste the API Key and Private Key into the matching fields.</> },
    ]} />
  );
}

export function AlpacaGuide() {
  return (
    <Guide color="#00E87A" steps={[
      { text: <>Log in to <B>Alpaca</B> (app.alpaca.markets). Choose your account type: Live or Paper.</> },
      {
        text: <>In the left menu, click <Path>Overview</Path> → scroll down to <B>Your API Keys</B> → click <B>View</B>.</>,
        note: <>If you don&apos;t have a key yet: click Generate New Key.</>,
      },
      { text: <>Your <B>API Key ID</B> and <B>Secret Key</B> will appear — copy both.</> },
      { text: <>Come back here: select Live or Paper to match your account, and paste both keys.</> },
    ]} />
  );
}