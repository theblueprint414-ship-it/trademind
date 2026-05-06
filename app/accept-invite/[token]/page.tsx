"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type InviteData = { fromName: string; fromEmail: string; toEmail: string };
type Plan = "free" | "pro" | "premium";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "needsLogin" | "needsPro" | "waitingPlan" | "accepting" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [, setPlan] = useState<Plan>("free");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const [invRes, meRes] = await Promise.all([
        fetch(`/api/partners/invite/${token}`),
        fetch("/api/me"),
      ]);

      if (!invRes.ok) {
        const d = await invRes.json().catch(() => ({}));
        setErrorMsg(d.error ?? "Invite not found");
        setState("error");
        return;
      }
      const invData = await invRes.json();
      setInvite(invData);

      if (meRes.status === 401) {
        setState("needsLogin");
        return;
      }
      const me = await meRes.json().catch(() => ({}));
      const userPlan: Plan = me.plan ?? "free";
      setPlan(userPlan);

      if (userPlan === "pro" || userPlan === "premium") {
        setState("ready");
      } else {
        setState("needsPro");
      }
    }
    load().catch(() => { setErrorMsg("Failed to load invite."); setState("error"); });
  }, [token]);

  async function openCheckout() {
    setCheckoutLoading(true);
    try {
      const r = await fetch("/api/lemonsqueezy/checkout", { method: "POST" });
      const { url, error } = await r.json();
      if (error === "already_premium") { window.location.reload(); return; }
      if (error) { alert(error); return; }
      window.location.href = url;
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoAccept") !== "1") return;

    setState("waitingPlan");
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({}));
      if (me.plan === "pro" || me.plan === "premium") {
        clearInterval(pollRef.current!);
        await doAccept();
      } else if (attempts >= 20) {
        clearInterval(pollRef.current!);
        setState("ready");
      }
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token]);

  async function doAccept() {
    setState("accepting");
    const res = await fetch(`/api/partners/invite/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    const data = await res.json();
    if (data.error) {
      if (res.status === 401) { router.push(`/login?callbackUrl=/accept-invite/${token}`); return; }
      setErrorMsg(data.error); setState("error"); return;
    }
    setState("done");
    setTimeout(() => router.push("/partners"), 2000);
  }

  async function handleDecline() {
    await fetch(`/api/partners/invite/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    });
    router.push("/dashboard");
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 36 }}>

        {state === "loading" && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 14 }}>
            Loading invite...
          </div>
        )}

        {state === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 className="font-bebas" style={{ fontSize: 28, marginBottom: 8 }}>Invite unavailable</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24 }}>{errorMsg}</p>
            <Link href="/dashboard"><button className="btn-ghost" style={{ width: "100%" }}>Go to Dashboard</button></Link>
          </div>
        )}

        {state === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,208,132,0.15)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--green)" }}><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 6.5 11.5-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="font-bebas" style={{ fontSize: 32, color: "var(--green)", marginBottom: 8 }}>Partner added!</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Redirecting to Partners...</p>
          </div>
        )}

        {state === "waitingPlan" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Confirming payment...</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Connecting you as a partner automatically</p>
          </div>
        )}

        {state === "needsLogin" && invite && (
          <>
            <InviteHeader invite={invite} />
            <div style={{ background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "var(--text-dim)" }}>
              You need a TradeMind account to join — free and takes one minute.
            </div>
            <Link href={`/login?callbackUrl=/accept-invite/${token}`} style={{ display: "block" }}>
              <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}>
                Create account &amp; join →
              </button>
            </Link>
          </>
        )}

        {state === "needsPro" && invite && (
          <>
            <InviteHeader invite={invite} />
            <div style={{ background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", marginBottom: 6 }}>TradeMind subscription required</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>
                Accountability partners require a TradeMind subscription. You&apos;ll be connected automatically after upgrading.
              </p>
            </div>
            <div style={{ marginBottom: 16, padding: "20px", background: "var(--surface2)", borderRadius: 12, textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 40, lineHeight: 1 }}>$39</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/month · 7-day free trial</div>
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%", padding: 14, fontSize: 15, marginBottom: 10 }}
              onClick={openCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Loading..." : "Start Free Trial & join →"}
            </button>
            <button className="btn-ghost" style={{ width: "100%", padding: 10, fontSize: 13 }} onClick={handleDecline}>
              Decline invite
            </button>
          </>
        )}

        {(state === "ready" || state === "accepting") && invite && (
          <>
            <InviteHeader invite={invite} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn-primary" style={{ width: "100%", padding: 14 }} onClick={doAccept} disabled={state === "accepting"}>
                {state === "accepting" ? "Accepting..." : "Accept invite"}
              </button>
              <button className="btn-ghost" style={{ width: "100%", padding: 12 }} onClick={handleDecline} disabled={state === "accepting"}>
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InviteHeader({ invite }: { invite: { fromName: string } }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,45,45,0.1)", border: "2px solid rgba(255,45,45,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--red)" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      </div>
      <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 8 }}>Accountability invite</h1>
      <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
        <strong style={{ color: "white" }}>{invite.fromName}</strong> wants you to be their accountability partner.
        You&apos;ll see each other&apos;s daily mental check-in scores.
      </p>
    </div>
  );
}