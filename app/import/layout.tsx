// Server Component wrapper — forces this route segment to render dynamically
// on every request instead of being served as a static cached asset from the
// CDN. Static pages bypass proxy.ts (the auth/onboarding gate) on cache hits,
// which let logged-out and not-yet-onboarded visitors see a broken empty shell
// instead of being redirected.
export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
