"use client";

interface Props {
  verdict: "GO" | "CAUTION" | "NO-TRADE" | null;
  score: number | null;
  accountSize: number;
}

const RULES = {
  "GO":       { riskPct: 1.0,  label: "Full size",    color: "var(--green)", desc: "Peak mental state — trade at normal size." },
  "CAUTION":  { riskPct: 0.5,  label: "Half size",    color: "var(--amber)", desc: "Elevated risk — reduce size by 50%." },
  "NO-TRADE": { riskPct: 0,    label: "No position",  color: "var(--red)",   desc: "Mental state too compromised — stay out." },
};

export default function PositionSizing({ verdict, score, accountSize }: Props) {
  if (!verdict || score === null) return null;

  const rule = RULES[verdict];
  const maxRiskDollars = accountSize * (rule.riskPct / 100);
  const maxPositionPct = rule.riskPct;

  return (
    <div className="card" style={{
      padding: "16px 20px",
      border: `1px solid ${rule.color}25`,
      background: verdict === "GO"
        ? "linear-gradient(135deg, rgba(0,232,122,0.03), var(--surface))"
        : verdict === "NO-TRADE"
        ? "linear-gradient(135deg, rgba(255,59,92,0.03), var(--surface))"
        : "linear-gradient(135deg, rgba(255,176,32,0.03), var(--surface))",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>TODAY&apos;S POSITION SIZE</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: rule.color, background: `${rule.color}15`, border: `1px solid ${rule.color}30`, borderRadius: 6, padding: "2px 8px" }}>
          {rule.label}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {verdict !== "NO-TRADE" ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Max risk per trade</div>
              <div className="font-bebas" style={{ fontSize: 28, color: rule.color, lineHeight: 1 }}>
                ${maxRiskDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{maxPositionPct}% of ${accountSize.toLocaleString()}</div>
            </div>
            <div style={{ height: 40, width: 1, background: "var(--border)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Size multiplier</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0.25, 0.5, 0.75, 1.0].map((m) => (
                  <div key={m} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: m <= rule.riskPct ? rule.color : "var(--surface3)",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                {verdict === "GO" ? "4/4 — full allocation" : "2/4 — reduce exposure"}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, lineHeight: 1.5 }}>
              {rule.desc}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Mental score: {score} — below the 45-point threshold.
            </div>
          </div>
        )}
      </div>

      {verdict !== "NO-TRADE" && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          {rule.desc}
        </div>
      )}
    </div>
  );
}