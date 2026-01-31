/**
 * NextAuth Configuration with Password Authentication
 *
 * This app uses password-based authentication with the Credentials provider.
 * Key features:
 * - Users log in with email and password
 * - Passwords are hashed with bcrypt
 * - Users with requirePasswordChange=true are forced to change password
 * - Session includes user ID, role, and password change requirement
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "./validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",

  // Credentials provider requires JWT sessions (not database sessions)
  session: {
    strategy: "jwt",
  },

  // Trust the host header on Vercel (required when NEXTAUTH_URL is not set)
  // This allows preview deployments to auto-detect their URL
  trustHost: true,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const validatedData = loginSchema.parse(credentials);

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              passwordHash: true,
              requirePasswordChange: true,
            },
          });

          // User not found or no password set
          if (!user || !user.passwordHash) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            validatedData.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user object (passwordHash excluded for security)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            requirePasswordChange: user.requirePasswordChange,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login/error",
  },

  callbacks: {
    async session({ session, token }) {
      // Add user data to session from token
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.requirePasswordChange = token.requirePasswordChange as boolean;
      }
      return session;
    },

    async jwt({ token, user }) {
      // On sign in, add user data to token
      if (user) {
        token.role = user.role;
        token.requirePasswordChange = user.requirePasswordChange;
      }

      // On subsequent requests, refresh user data from database
      // This ensures requirePasswordChange flag is up-to-date
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, requirePasswordChange: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.requirePasswordChange = dbUser.requirePasswordChange;
        }
      }

      return token;
    },
  },
});
