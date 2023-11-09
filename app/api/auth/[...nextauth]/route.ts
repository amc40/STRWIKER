import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from "next-auth/providers/github";

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: String(process.env.GITHUB_ID),
      clientSecret: String(process.env.GITHUB_SECRET),
    }),
  ]
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
