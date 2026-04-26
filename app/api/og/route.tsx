import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function verdictColor(score: number) {
  if (score >= 70) return "#00E87A";
  if (score >= 45) return "#FFB020";
  return "#FF3B5C";
}

function verdictLabel(score: number) {
  if (score >= 70) return "GO";
  if (score >= 45) return "CAUTION";
  return "NO-TRADE";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreParam = searchParams.get("score");
  const streak = searchParams.get("streak");
  const name = searchParams.get("name");

  const score = scoreParam ? Math.min(100, Math.max(0, parseInt(scoreParam, 10))) : null;
  const verdict = score !== null ? verdictLabel(score) : null;
  const color = score !== null ? verdictColor(score) : "#4F8EF7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#070B14",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        {score !== null && (
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: color,
              opacity: 0.07,
              filter: "blur(80px)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Logo area */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(79,142,247,0.15)",
              border: "1px solid rgba(79,142,247,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 18, height: 18, background: "#4F8EF7", borderRadius: "50%", display: "flex" }} />
          </div>
          <span style={{ color: "#E8F0FF", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            TradeMind
          </span>
        </div>

        {/* Main content */}
        {score !== null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {name && (
              <div style={{ color: "#3D4F6A", fontSize: 18, marginBottom: 16, letterSpacing: "0.04em" }}>
                {name.split(" ")[0]}&apos;s mental score today
              </div>
            )}

            {/* Score ring mockup */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                border: `6px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
                boxShadow: `0 0 60px ${color}40`,
                background: `${color}12`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 11, color: "#3D4F6A", letterSpacing: "0.1em", marginTop: 2 }}>/100</span>
              </div>
            </div>

            {/* Verdict */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 20,
                textShadow: `0 0 40px ${color}80`,
              }}
            >
              {verdict}
            </div>

            {streak && parseInt(streak) >= 3 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: "rgba(255,176,32,0.12)",
                  border: "1px solid rgba(255,176,32,0.3)",
                }}
              >
                <span style={{ fontSize: 20 }}>🔥</span>
                <span style={{ color: "#FFB020", fontSize: 16, fontWeight: 700 }}>
                  {streak}-day streak
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 80px",
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: "#E8F0FF",
                lineHeight: 1.1,
                marginBottom: 20,
                letterSpacing: "-0.03em",
              }}
            >
              Know Your Mental State Before You Trade
            </div>
            <div style={{ color: "#3D4F6A", fontSize: 20, lineHeight: 1.5 }}>
              60-second daily check-in · GO / CAUTION / NO-TRADE
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 48,
            color: "#3D4F6A",
            fontSize: 14,
          }}
        >
          trademindedge.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}