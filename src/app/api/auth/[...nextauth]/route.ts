import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { callBackend } from '@/lib/backend';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // Register the user in the backend on the first Google login
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        try {
          await callBackend(
            { email: user.email, name: user.name, image: user.image },
            '/me'
          );
          return true; // OK to login
        } catch (error) {
          console.error("Error syncing user with backend during sign in", error);
          return false; // Prevent login on error
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
