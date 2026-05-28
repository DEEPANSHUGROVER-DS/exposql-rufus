import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth v5, JWT strategy (no DB adapter — the brief warns that database
 * sessions deadlock at first sign-in: tables need the user, the user needs
 * the tables). We resolve the user + workspace by email inside API routes
 * via lib/db/queries.ensureUserAndWorkspace().
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
      }
      if (profile?.picture) token.picture = profile.picture as string;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
});
