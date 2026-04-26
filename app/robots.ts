import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/blog", "/vs-tradezella", "/for-ftmo-traders", "/terms", "/privacy", "/refund", "/contact", "/partners-program"],
      disallow: ["/api/", "/dashboard", "/checkin", "/journal", "/analytics", "/coach", "/settings", "/onboarding", "/leaderboard", "/playbook", "/recap", "/report", "/result", "/partners", "/accept-invite/", "/join-circle/", "/login", "/unsubscribe"],
    },
    sitemap: "https://trademindedge.com/sitemap.xml",
  };
}