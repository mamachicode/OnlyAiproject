// @ts-nocheck
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcrypt";

// Main NextAuth config
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.username };
      },
    }),
  ],

  session: { strategy: "jwt" },
};

// Allow "auth()" usage in server components + API routes
export const auth = NextAuth(authOptions);
