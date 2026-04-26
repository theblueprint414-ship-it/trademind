import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — TradeMind",
  description: "TradeMind Terms of Service. Please read before using the platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using TradeMind ("Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and TradeMind. You must be at least 18 years old to use the Service. By using the Service, you represent that you are at least 18 years old and have the legal capacity to enter into this agreement.`,
  },
  {
    title: "2. Description of Service",
    body: `TradeMind is a mental performance tracking tool designed to help traders monitor and reflect on their psychological state before and during trading sessions. The Service provides daily mental check-ins, scoring, trade journaling, behavioral pattern analysis, and accountability tools. TradeMind is provided strictly for self-improvement and informational purposes only. The Service is not a financial product, investment platform, or trading system.`,
  },
  {
    title: "3. NOT Financial Advice — Important Disclaimer",
    body: `TRADEMIND DOES NOT PROVIDE FINANCIAL, INVESTMENT, LEGAL, OR TRADING ADVICE OF ANY KIND. The mental scores, GO / CAUTION / NO-TRADE verdicts, AI Coach messages, behavioral alerts, and all other outputs of the Service are personal wellness indicators based on your self-reported data only. They do not constitute recommendations to buy, sell, hold, or avoid any financial instrument. All trading decisions are solely your responsibility. TradeMind is not a registered investment adviser, broker-dealer, financial analyst, or financial planner. No content on TradeMind should be construed as professional financial or investment advice. Past performance of any trading strategy is not indicative of future results. Trading involves substantial risk and may not be suitable for all individuals. You may lose some or all of your capital.`,
  },
  {
    title: "4. AI Coach Disclaimer",
    body: `The AI Coach feature ("Alex") is powered by large language model technology. Alex is not a licensed financial advisor, licensed therapist, licensed psychologist, or mental health professional. The coaching messages generated are based solely on the data you input into TradeMind and are intended as motivational and reflective prompts only. Alex's outputs do not constitute professional advice of any kind. Do not make financial, medical, or personal decisions based solely on AI Coach output. TradeMind expressly disclaims all liability for any actions taken based on AI Coach messages.`,
  },
  {
    title: "5. Third-Party Affiliations Disclaimer",
    body: `TradeMind is an independent company and is NOT affiliated with, endorsed by, sponsored by, or in any way officially connected with any prop trading firm, brokerage, or financial company referenced in our marketing materials, including but not limited to: FTMO, TopStep, Alpaca, Bybit, Binance, Coinbase, Kraken, Tradovate, MetaTrader, Interactive Brokers, TradeZella, Edgewonk, or TraderSync. All trademarks, logos, and brand names referenced belong to their respective owners. References to these companies are purely informational and for user convenience.`,
  },
  {
    title: "6. Broker API Access",
    body: `When you connect a broker account, you grant TradeMind read-only access to your trade history or trade count data via API keys that you voluntarily provide. TradeMind will NEVER place, modify, cancel, or otherwise interact with any trade or order on your behalf. You are solely responsible for the security of your API keys. You can disconnect your broker and delete stored API credentials at any time from Settings. TradeMind is not responsible for any actions taken by third-party brokers or any losses arising from broker connectivity issues.`,
  },
  {
    title: "7. Subscription, Billing, and Free Trial",
    body: `Paid plans include a 4-day free trial. You will not be charged during the trial period. If you do not cancel before the trial ends, your selected plan will automatically begin billing: Pro at $19/month or Premium at $45/month, processed by Paddle (our Merchant of Record). By providing payment information, you authorize Paddle to charge you on a recurring basis. All charges after the free trial are final. We do not offer refunds except where required by applicable law or at Paddle's discretion. You may cancel your subscription at any time through Settings; cancellation takes effect at the end of the current billing period. Annual pricing, if offered, is non-refundable after the trial period. For billing disputes, contact support@trademindedge.com or Paddle directly at paddle.com.`,
  },
  {
    title: "8. Intellectual Property",
    body: `The Service, including all software, algorithms, designs, text, graphics, and trade secrets, is owned by TradeMind and is protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial purposes. You may not copy, modify, distribute, sell, reverse engineer, or create derivative works from any part of the Service. You retain ownership of the personal data you input, but grant TradeMind a license to process and store it to provide the Service.`,
  },
  {
    title: "9. Prohibited Uses",
    body: `You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to any part of the Service; (c) scrape, crawl, or systematically extract data from the Service; (d) use the Service to transmit spam, malware, or harmful content; (e) impersonate another person or entity; (f) use the Service in a way that could damage, disable, or impair it; (g) attempt to circumvent any billing, rate-limiting, or plan restrictions; (h) share your account with others or resell access.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TRADEMIND AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF TRADING CAPITAL, DATA LOSS, OR ANY OTHER FINANCIAL LOSSES, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. IN NO EVENT SHALL TRADEMIND'S TOTAL LIABILITY TO YOU EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM, OR $50 USD, WHICHEVER IS GREATER. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF LIABILITY, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.`,
  },
  {
    title: "11. Disclaimer of Warranties",
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. TRADEMIND DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.`,
  },
  {
    title: "12. Indemnification",
    body: `You agree to indemnify, defend, and hold harmless TradeMind and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; or (d) any trading losses or financial decisions made in connection with your use of the Service.`,
  },
  {
    title: "13. Dispute Resolution — Binding Arbitration",
    body: `PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS. ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL BE RESOLVED EXCLUSIVELY BY BINDING INDIVIDUAL ARBITRATION, NOT IN COURT. BY AGREEING TO THESE TERMS, YOU AND TRADEMIND EACH WAIVE THE RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE IN A CLASS ACTION LAWSUIT. The arbitration shall be conducted by a recognized arbitration provider under its applicable rules. The arbitration will take place in the jurisdiction of TradeMind's principal place of business, or by written agreement between the parties, remotely. The arbitrator's decision shall be final and binding. Notwithstanding the foregoing, either party may seek emergency injunctive or other equitable relief in a court of competent jurisdiction to prevent irreparable harm.`,
  },
  {
    title: "14. Class Action Waiver",
    body: `YOU AND TRADEMIND AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. Further, unless both you and TradeMind agree otherwise, the arbitrator may not consolidate more than one person's claims, and may not otherwise preside over any form of a representative or class proceeding.`,
  },
  {
    title: "15. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. For any matters not subject to arbitration, you consent to the exclusive jurisdiction of the state and federal courts located in Delaware.`,
  },
  {
    title: "16. Account Termination",
    body: `You may delete your account at any time from Settings. TradeMind reserves the right to suspend or terminate your account immediately, without prior notice, for conduct that violates these Terms, is harmful to other users, or disrupts the Service. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination shall survive, including Sections 3, 4, 5, 10, 11, 12, 13, 14, and 15.`,
  },
  {
    title: "17. Modifications to Terms",
    body: `TradeMind reserves the right to modify these Terms at any time. We will notify you of material changes by email or by posting a notice on the Service. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms. We recommend reviewing these Terms periodically.`,
  },
  {
    title: "18. Force Majeure",
    body: `TradeMind shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, government actions, internet outages, or third-party service failures.`,
  },
  {
    title: "19. Severability",
    body: `If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms will otherwise remain in full force and effect.`,
  },
  {
    title: "20. Contact",
    body: `For questions about these Terms: support@trademindedge.com`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none" }}>← Back to TradeMind</Link>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "32px 0 8px" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>Last updated: April 24, 2026</p>
        <div style={{ background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: "var(--text)" }}>IMPORTANT:</strong> TradeMind is not a financial advisor and does not provide investment advice. All trading decisions are solely your responsibility. By using TradeMind, you agree to binding arbitration and waive the right to class action lawsuits (Section 13–14).
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{s.title}</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
            <Link href="/privacy" style={{ color: "var(--blue)", textDecoration: "none" }}>Privacy Policy</Link>
            {" · "}
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Back to TradeMind</Link>
          </p>
        </div>
      </div>
    </div>
  );
}