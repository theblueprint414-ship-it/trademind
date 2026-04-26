import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Lightweight auth config — no Prisma adapter, safe for Edge Runtime (middleware)
// Resend (email) provider intentionally excluded: email providers require a DB adapter
// which is not available in Edge Runtime. Resend is configured only in auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};
