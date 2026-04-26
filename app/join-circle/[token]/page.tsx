"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

type CircleInfo = { id: string; name: string; creatorName: string; memberCount: number; token: string };

export default function JoinCirclePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [circle, setCircle] = useState<CircleInfo | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "needsLogin" | "needsPro" | "waitingPlan" | "joining" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const [circleRes, meRes] = await Promise.all([
        fetch(`/api/circles/join?token=${token}`),
        fetch("/api/me"),
      ]);

      if (!circleRes.ok) {
        const d = await circleRes.json().catch(() => ({}));
        setErrorMsg(d.error ?? "Circle not found");
        setState("error");
        return;
      }
      setCircle(await circleRes.json());

      if (meRes.status === 401) { setState("needsLogin"); return; }
      const me = await meRes.json().catch(() => ({}));
      const plan: string = me.plan ?? "free";

      if (plan === "pro" || plan === "premium") {
        setState("ready");
      } else {
        setState("needsPro");
        initPaddle();
      }
    }
    load().catch(() => { setErrorMsg("Failed to load circle."); setState("error"); });
  }, [token]);

  function initPaddle() {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!clientToken) return;
    const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";
    initializePaddle({ token: clientToken, environment: env }).then((p) => { if (p) setPaddle(p); });
  }

  async function openCheckout() {
    if (!paddle) { alert("Payment is loading. Try again in a second."); return; }
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID;
    if (!priceId) { alert("Paddle not configured."); return; }
    setCheckoutLoading(true);
    try {
      const me = await fetch("/api/me").then((r) => r.json());
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: me.email ? { email: me.email } : undefined,
        customData: { userId: me.id ?? "", plan: "pro" },
        settings: { successUrl: `${window.location.origin}/join-circle/${token}?autoJoin=1` },
      });
    } catch { alert("Network error. Try again."); }
    finally { setCheckoutLoading(false); }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoJoin") !== "1") return;

    setState("waitingPlan");
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({}));
      if (me.plan === "pro" || me.plan === "premium") {
        clearInterval(pollRef.current!);
        await doJoin();
      } else if (attempts >= 20) {
        clearInterval(pollRef.current!);
        setState("ready");
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token]);

  async function doJoin() {
    setState("joining");
    const res = await fetch("/api/circles/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { router.push(`/login?callbackUrl=/join-circle/${token}`); return; }
      setErrorMsg(data.error ?? "Failed to join"); setState("error"); return;
    }
    setState("done");
    setTimeout(() => router.push("/partners"), 2000);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 36 }}>

        {state === "loading" && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 14 }}>Loading circle...</div>
        )}

        {state === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 className="font-bebas" style={{ fontSize: 28, marginBottom: 8 }}>Circle unavailable</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>{errorMsg}</p>
            <Link href="/dashboard"><button className="btn-ghost" style={{ width: "100%" }}>Go to Dashboard</button></Link>
          </div>
        )}

        {state === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,208,132,0.15)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
            <div className="font-bebas" style={{ fontSize: 32, color: "var(--green)", marginBottom: 8 }}>You&apos;re in!</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Redirecting to Partners...</p>
          </div>
        )}

        {state === "waitingPlan" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Confirming payment...</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Adding you to the circle automatically</p>
          </div>
        )}

        {circle && state === "needsLogin" && (
          <CircleHeader circle={circle} />
        )}
        {circle && state === "needsLogin" && (
          <>
            <div style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "var(--text-dim)" }}>
              You need a TradeMind account to join — free and takes one minute.
            </div>
            <Link href={`/login?callbackUrl=/join-circle/${token}`} style={{ display: "block" }}>
              <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}>Create account &amp; join →</button>
            </Link>
          </>
        )}

        {circle && state === "needsPro" && (
          <>
            <CircleHeader circle={circle} />
            <div style={{ background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", marginBottom: 6 }}>Pro plan required</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>
                Trading Circles require a Pro subscription. You&apos;ll be added automatically after upgrading.
              </p>
            </div>
            <div style={{ marginBottom: 16, padding: "20px", background: "var(--surface2)", borderRadius: 12, textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 40, lineHeight: 1 }}>$29</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/month · Cancel anytime</div>
            </div>
            <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={openCheckout} disabled={checkoutLoading || !paddle}>
              {checkoutLoading ? "Loading..." : !paddle ? "Loading payment..." : "Upgrade to Pro & join →"}
            </button>
          </>
        )}

        {circle && (state === "ready" || state === "joining") && (
          <>
            <CircleHeader circle={circle} />
            <button className="btn-primary" style={{ width: "100%", padding: 14 }} onClick={doJoin} disabled={state === "joining"}>
              {state === "joining" ? "Joining..." : `Join "${circle.name}" →`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CircleHeader({ circle }: { circle: CircleInfo }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "2px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🔵</div>
      <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 6 }}>{circle.name}</h1>
      <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
        Created by <strong style={{ color: "white" }}>{circle.creatorName}</strong> · {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
        Everyone in this circle sees each other&apos;s daily mental check-in scores.
      </p>
    </div>
  );
}