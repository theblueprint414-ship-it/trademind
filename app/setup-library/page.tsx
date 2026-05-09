"use client";

import React, { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Setup = {
  code: string;
  label: string;
  category: "structure" | "liquidity" | "entry" | "confirmation";
  tier: "core" | "advanced";
  description: string;
  howToTrade: string;
  timeframes: string[];
  confluence: string[];
  pitfalls: string;
};

const SETUPS: Setup[] = [
  {
    code: "FVG",
    label: "Fair Value Gap",
    category: "entry",
    tier: "core",
    description: "A 3-candle imbalance where the high of candle 1 does not overlap the low of candle 3, leaving an unfilled gap in price. ICT calls these areas 'inefficiencies' that price returns to fill.",
    howToTrade: "1. Identify displacement (strong impulsive move)\n2. Mark the FVG (gap between candle 1 high and candle 3 low for bullish; inverse for bearish)\n3. Wait for price to retrace into the FVG\n4. Enter at 50% of the FVG or on a confirmation candle\n5. Stop below the FVG for longs, above for shorts",
    timeframes: ["1m", "5m", "15m", "1H", "4H"],
    confluence: ["OB alignment", "Kill zone timing", "HTF bias"],
    pitfalls: "Don't trade FVGs against the higher timeframe bias. Old FVGs (3+ sessions) lose significance.",
  },
  {
    code: "iFVG",
    label: "Inverse FVG",
    category: "entry",
    tier: "advanced",
    description: "A previously bullish FVG that has been fully mitigated and now acts as resistance (or vice versa for bearish). Price has 'flipped' the imbalance.",
    howToTrade: "1. Find a FVG that has been fully filled\n2. Mark the zone — it now acts as the opposite direction\n3. Look for price to return to the iFVG zone\n4. Enter when bearish (or bullish) confirmation appears at the zone",
    timeframes: ["5m", "15m", "1H"],
    confluence: ["BOS/ChoCh above/below", "Opposite-direction OB nearby"],
    pitfalls: "Requires HTF confirmation. Not all filled FVGs become strong iFVGs — context matters.",
  },
  {
    code: "OB",
    label: "Order Block",
    category: "entry",
    tier: "core",
    description: "The last opposing candle before a strong impulsive move that creates a BOS. Represents institutional order flow — 'the last place smart money bought/sold before the move.'",
    howToTrade: "1. Find a BOS or significant structural move\n2. Go back to the last opposite-direction candle before displacement began\n3. Mark that candle's body (some traders use wick-to-wick)\n4. Wait for price to retrace into the OB\n5. Enter at the 50% or close of the OB candle, stop beyond the OB",
    timeframes: ["15m", "1H", "4H", "Daily"],
    confluence: ["FVG overlap (breaker block scenario)", "Premium/Discount positioning", "Kill zone"],
    pitfalls: "Order blocks that have been 'tapped' multiple times lose strength. Only use first or second touch.",
  },
  {
    code: "BOS",
    label: "Break of Structure",
    category: "structure",
    tier: "core",
    description: "When price closes beyond a significant swing high (bullish BOS) or swing low (bearish BOS), confirming continuation of the current trend. Distinguishes trend continuation from reversal.",
    howToTrade: "1. Identify the current market structure (HH/HL or LH/LL)\n2. Mark the last significant swing high/low\n3. A candle close beyond that level = BOS\n4. Use BOS as bias confirmation — only trade in BOS direction\n5. Look for pullbacks to OBs/FVGs in the BOS direction",
    timeframes: ["All timeframes — align HTF to LTF"],
    confluence: ["Displacement candle causes the BOS", "Volume spike", "Kill zone timing"],
    pitfalls: "Don't confuse BOS with a liquidity sweep. Price can pierce a level and reverse (ChoCh) vs truly break.",
  },
  {
    code: "ChoCh",
    label: "Change of Character",
    category: "structure",
    tier: "core",
    description: "The first BOS in the opposite direction of the prevailing trend — signals a potential reversal. In a downtrend, a ChoCh is the first bullish BOS. The market 'character' has changed.",
    howToTrade: "1. Identify prevailing trend\n2. In a downtrend: wait for price to break above a prior swing high\n3. That first bullish BOS = ChoCh\n4. Now look for the first pullback OB/FVG in the new direction\n5. Manage risk carefully — ChoCh trades are counter-trend until confirmed",
    timeframes: ["1H", "4H", "Daily for major reversals"],
    confluence: ["Liquidity sweep before ChoCh strengthens signal", "Deep retracement", "HTF premium/discount extreme"],
    pitfalls: "One ChoCh is not enough. Look for BOS + ChoCh structure building on the LTF before committing large size.",
  },
  {
    code: "SMT",
    label: "SMT Divergence",
    category: "confirmation",
    tier: "advanced",
    description: "Smart Money Technique — when two correlated instruments (e.g., ES/NQ or EUR/USD and GBP/USD) diverge in structure. One makes a lower low while the other does not, signaling institutional positioning.",
    howToTrade: "1. Watch two correlated pairs simultaneously\n2. When Pair A sweeps a low but Pair B does NOT make a new low\n3. This non-confirmation = SMT divergence (bullish)\n4. Enter long on Pair A (the one that swept and reversed)\n5. Tight stop below the sweep candle",
    timeframes: ["1m", "5m", "15m during kill zones"],
    confluence: ["FVG/OB alignment on LTF", "Kill zone (London/NY open)", "HTF bullish bias"],
    pitfalls: "Only works when assets are truly correlated. Divergence during ranging markets is noise, not signal.",
  },
  {
    code: "LiqSW",
    label: "Liquidity Sweep",
    category: "liquidity",
    tier: "core",
    description: "Price pierces beyond equal highs (EQH) or equal lows (EQL) — areas where retail stop orders cluster — before reversing. Institutions use this move to fill orders against retail stops.",
    howToTrade: "1. Identify equal highs/lows (EQH/EQL) — horizontal price clusters\n2. Mark the zone with a few pips/ticks buffer\n3. Wait for price to pierce beyond and immediately reverse\n4. The reversal candle = entry signal\n5. Stop beyond the sweep wick, target opposite structure",
    timeframes: ["5m", "15m", "1H"],
    confluence: ["HTF narrative (premium selling / discount buying)", "Kill zone", "ChoCh after sweep"],
    pitfalls: "Not every wick beyond EQH/EQL is a sweep — needs a clear rejection/reversal candle. Avoid during news.",
  },
  {
    code: "DISP",
    label: "Displacement",
    category: "structure",
    tier: "core",
    description: "A strong, impulsive move driven by institutional order flow — typically 3+ consecutive candles in one direction with no overlap. Often the move that creates FVGs and validates OBs.",
    howToTrade: "1. Identify a strong impulsive move with little to no pullback\n2. This displacement should create at least one FVG\n3. Mark the OB (last candle before displacement)\n4. Wait for price to retrace into the FVG or OB\n5. Enter in the direction of displacement",
    timeframes: ["1m", "5m", "15m", "1H"],
    confluence: ["Kill zone timing", "News catalyst", "HTF bias alignment"],
    pitfalls: "Displacement during low liquidity (Asia session outside FX pairs) is less reliable. Wait for kill zones.",
  },
  {
    code: "EQH",
    label: "EQH / EQL",
    category: "liquidity",
    tier: "core",
    description: "Equal Highs and Equal Lows — price levels where two or more swing points cluster at the same price. Retail traders place stops beyond these levels, making them liquidity pools for smart money.",
    howToTrade: "1. Mark two or more swing highs/lows at the same price\n2. Treat the zone as a liquidity target (not a resistance/support in the traditional sense)\n3. Expect price to sweep these levels before reversing\n4. Trade the reversal, not the breakout — buy after EQL sweep, sell after EQH sweep\n5. Or use EQH/EQL as TP targets for existing trades",
    timeframes: ["All timeframes"],
    confluence: ["Premium/discount model", "Opposing FVG/OB for reversal", "Kill zone"],
    pitfalls: "Price sometimes breaks through EQH/EQL and continues — this is when a BOS occurs. Context determines whether it's a sweep or a breakout.",
  },
];

const CATEGORIES = {
  structure: { label: "Market Structure", color: "#60A5FA" },
  liquidity: { label: "Liquidity", color: "#F59E0B" },
  entry: { label: "Entry Models", color: "#00E87A" },
  confirmation: { label: "Confirmation", color: "#A78BFA" },
} as const;

export default function SetupLibraryPage() {
  const [selected, setSelected] = useState<Setup | null>(null);
  const [filter, setFilter] = useState<"all" | keyof typeof CATEGORIES>("all");

  const filtered = filter === "all" ? SETUPS : SETUPS.filter((s) => s.category === filter);

  if (selected) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
        <div style={{ padding: "18px 16px 0" }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: "none", border: "none", fontSize: 13, color: "var(--text-dim)", cursor: "pointer", padding: 0, marginBottom: 12 }}
          >
            ← Back to Library
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              background: CATEGORIES[selected.category].color + "22",
              border: `1px solid ${CATEGORIES[selected.category].color}44`,
              borderRadius: 6, padding: "2px 8px",
              fontSize: 11, fontWeight: 700, color: CATEGORIES[selected.category].color,
            }}>
              {CATEGORIES[selected.category].label}
            </div>
            {selected.tier === "advanced" && (
              <div style={{ background: "#A78BFA22", border: "1px solid #A78BFA44", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#A78BFA" }}>
                Advanced
              </div>
            )}
          </div>

          <h1 style={{ margin: "6px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
            {selected.code} — {selected.label}
          </h1>
        </div>

        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Description */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>What It Is</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{selected.description}</p>
          </div>

          {/* How to trade */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>How to Trade It</div>
            {selected.howToTrade.split("\n").map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{line.replace(/^\d+\.\s/, "")}</span>
              </div>
            ))}
          </div>

          {/* Timeframes */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Best Timeframes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.timeframes.map((tf) => (
                <span key={tf} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "var(--text-dim)" }}>{tf}</span>
              ))}
            </div>
          </div>

          {/* Confluence */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Confluence Factors</div>
            {selected.confluence.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                <span style={{ color: "#00E87A", fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Pitfalls */}
          <div style={{ background: "#FF3B5C0D", border: "1px solid #FF3B5C22", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#FF3B5C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Common Pitfalls</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{selected.pitfalls}</p>
          </div>
        </div>

        <div style={{ height: 20 }} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 8px" }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>← Dashboard</Link>
        <h1 style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Setup Library</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>ICT / Smart Money Concepts reference guide</p>
      </div>

      {/* Category filter */}
      <div style={{ padding: "8px 16px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0,
            background: filter === "all" ? "var(--blue)" : "var(--surface2)",
            color: filter === "all" ? "#fff" : "var(--text-dim)",
          }}
        >
          All ({SETUPS.length})
        </button>
        {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, { label: string; color: string }][]).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: filter === key ? color + "22" : "var(--surface2)",
              color: filter === key ? color : "var(--text-dim)",
              borderColor: filter === key ? color + "44" : "transparent",
              borderWidth: 1, borderStyle: "solid",
            }}
          >
            {label} ({SETUPS.filter((s) => s.category === key).length})
          </button>
        ))}
      </div>

      {/* Setup cards */}
      <div style={{ padding: "8px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((setup) => {
          const cat = CATEGORIES[setup.category];
          return (
            <button
              key={setup.code}
              onClick={() => setSelected(setup)}
              style={{
                width: "100%", textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>{setup.code}</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{setup.label}</span>
                    {setup.tier === "advanced" && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#A78BFA", background: "#A78BFA15", border: "1px solid #A78BFA30", borderRadius: 4, padding: "1px 5px" }}>ADV</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {setup.description}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ background: cat.color + "18", border: `1px solid ${cat.color}33`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700, color: cat.color }}>
                    {cat.label}
                  </div>
                  <span style={{ fontSize: 16, color: "var(--text-muted)" }}>›</span>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
                {setup.timeframes.slice(0, 4).map((tf) => (
                  <span key={tf} style={{ background: "var(--surface2)", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "var(--text-muted)" }}>{tf}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}