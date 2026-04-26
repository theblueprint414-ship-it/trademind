import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — TradeMind",
  description: "TradeMind Privacy Policy. How we collect, use, and protect your data.",
};

const sections = [
  {
    title: "1. Who We Are",
    body: `TradeMind ("we," "us," or "our") operates the trademindedge.com platform. We are a mental performance tracking tool for traders. For questions about this policy, contact us at: support@trademindedge.com`,
  },
  {
    title: "2. Information We Collect",
    body: `We collect the following categories of information:

a) Account data: Email address (required for login via Google OAuth or email magic link), display name, profile photo (from Google).

b) Check-in data: Your daily responses to mental wellness check-in questions (sleep quality, emotional state, focus level, financial stress, recent performance). These are scored on a 0–100 scale to produce your daily verdict.

c) Journal and trade data: Trade entries you log including symbol, P&L, setup notes, emotion ratings, mistakes, reflections, and any chart screenshot images you upload.

d) Broker API credentials: API keys you voluntarily provide to connect your broker account. We use these solely to read trade count data — we never execute trades or access account balances beyond what is needed for the Service.

e) Usage data: Pages visited, features used, and general platform interactions — used for product improvement only, not for advertising profiling.

f) Payment data: Handled entirely by Paddle (our Merchant of Record). TradeMind does not store, process, or have access to your full payment card details.

g) Communications: Support emails or messages you send us.`,
  },
  {
    title: "3. How We Use Your Information",
    body: `We use your data only to:
• Provide and improve the TradeMind service (calculate your mental score, track streaks, generate analytics)
• Send you transactional emails (check-in reminders, trial notifications, account alerts) — only if you have email reminders enabled
• Provide AI Coach analysis based on your own data
• Process subscription payments via Paddle
• Respond to customer support requests
• Ensure platform security and prevent abuse

We do NOT use your data for advertising, sell your data to third parties, share your trading performance with any third party, or use your data to train AI models (your personal data is not used to train Anthropic's models — it is only used in your individual session context).`,
  },
  {
    title: "4. Third-Party Services",
    body: `We share data with the following third-party processors only to the extent necessary to provide the Service:

• Google LLC (OAuth authentication) — privacy.google.com
• Resend (email delivery) — resend.com/privacy
• Paddle.com Inc. (payment processing, Merchant of Record) — paddle.com/privacy — Paddle independently complies with GDPR and handles all billing
• Vercel Inc. (hosting and infrastructure) — vercel.com/legal/privacy-policy
• Turso / Chiselstrike (database hosting) — turso.tech/privacy
• Anthropic PBC (AI Coach feature — Claude API) — anthropic.com/privacy — your data is sent to Anthropic only when you use the AI Coach feature; Anthropic does not use API inputs to train its models by default
• MetaApi (MT4/MT5 broker integration, if you connect a MetaTrader account) — metaapi.cloud/privacy

Each of these services has its own privacy policy. We recommend reviewing them. We do not use advertising networks, social tracking pixels, or data brokers.`,
  },
  {
    title: "5. Data Storage and Security",
    body: `Your data is stored in an encrypted database hosted on Turso/Libsql infrastructure. API keys you provide for broker connections are stored encrypted at rest using industry-standard AES encryption. We use HTTPS/TLS for all data transmission. Chart screenshots are stored on Vercel Blob (encrypted at rest). We implement rate limiting, authentication guards, and access controls throughout the platform. No security measure is 100% guaranteed. In the event of a data breach that is likely to result in a risk to your rights, we will notify affected users and relevant supervisory authorities as required by applicable law within 72 hours of becoming aware.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your data for as long as your account is active. If you delete your account, all associated data (check-ins, journal entries, analytics, broker credentials, playbook rules) is permanently and irrecoverably deleted from our systems within 30 days. Aggregated, anonymized usage statistics that cannot identify you may be retained indefinitely. Paddle retains billing records as required by applicable tax and financial regulations.`,
  },
  {
    title: "7. Cookies and Local Storage",
    body: `We use only essential cookies and browser storage:
• Authentication session cookie — required for login, expires after 30 days of inactivity
• Onboarding state — stored in localStorage to track setup completion; cleared on logout

We do NOT use advertising cookies, cross-site tracking cookies, social media pixels, or analytics cookies. A cookie consent banner is therefore not required under our current setup, but this policy informs you of all storage use.`,
  },
  {
    title: "8. Your Rights (GDPR — EU/EEA Users)",
    body: `If you are located in the European Union or European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):

• Right of Access — Request a copy of all personal data we hold about you. Use the "Download my data" button in Settings or email support@trademindedge.com.
• Right to Rectification — Request correction of inaccurate personal data.
• Right to Erasure ("Right to be Forgotten") — Request deletion of your account and all associated data via Settings → Delete Account, or by emailing us.
• Right to Data Portability — Download your data in machine-readable JSON format from Settings.
• Right to Object — Object to processing of your data for marketing purposes by disabling email reminders in Settings.
• Right to Restrict Processing — Request that we limit how we use your data.
• Right to Withdraw Consent — You may withdraw consent for email communications at any time via the unsubscribe link in any email or from Settings.
• Right to Lodge a Complaint — You have the right to lodge a complaint with your local data protection supervisory authority (e.g., ICO in the UK, CNIL in France).

Our legal basis for processing: Contract performance (to provide the Service you subscribed to) and Legitimate Interests (security, fraud prevention, product improvement). For email marketing: Consent (you opt in at signup and can opt out at any time).`,
  },
  {
    title: "9. Your Rights (CCPA — California Residents)",
    body: `If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the following rights:

• Right to Know — You have the right to know what personal information we collect, use, disclose, and sell. We do not sell personal information.
• Right to Delete — You have the right to request deletion of personal information we have collected from you (via Settings → Delete Account).
• Right to Non-Discrimination — We will not discriminate against you for exercising any CCPA rights.
• Right to Opt-Out of Sale — We do not sell personal information. No opt-out needed.

To exercise CCPA rights, contact us at support@trademindedge.com.`,
  },
  {
    title: "10. Children's Privacy",
    body: `TradeMind is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from anyone under 18. If we become aware that a user under 18 has provided personal information, we will promptly delete their account and data. If you believe we have inadvertently collected data from a minor, please contact us at support@trademindedge.com.`,
  },
  {
    title: "11. International Data Transfers",
    body: `TradeMind operates primarily in the United States. If you are located outside the United States, your personal data will be transferred to and processed in the United States. For users in the EU/EEA/UK, transfers to the US are made on the basis of Standard Contractual Clauses (SCCs) or equivalent transfer mechanisms where applicable through our third-party processors (including Vercel, Anthropic, and Resend). By using the Service, you consent to the transfer of your data to the United States as described in this policy.`,
  },
  {
    title: "12. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a prominent notice on the Service. Continued use of the Service after changes take effect constitutes acceptance of the updated policy. The "Last updated" date at the top of this policy reflects the most recent revision.`,
  },
  {
    title: "13. Contact and Data Controller",
    body: `For any privacy questions, data access requests, or complaints, contact us at: support@trademindedge.com

We will respond to all requests within 30 days (or within the timeframe required by applicable law).`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none" }}>← Back to TradeMind</Link>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "32px 0 8px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>Last updated: April 24, 2026</p>

        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{s.title}</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.9, whiteSpace: "pre-line" }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
            <Link href="/terms" style={{ color: "var(--blue)", textDecoration: "none" }}>Terms of Service</Link>
            {" · "}
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Back to TradeMind</Link>
          </p>
        </div>
      </div>
    </div>
  );
}