/**
 * NextAuth Configuration with Email Gating
 *
 * This app is invite-only. The signIn callback implements email gating:
 * - BEFORE a magic link is sent, we check if the email is approved
 * - An email is approved if: (1) existing user, (2) valid invitation, or (3) first user
 * - Unapproved emails are redirected to /login/not-approved
 *
 * When a new user is created (createUser event):
 * - If they have an invitation, their role is set from it and the invitation is consumed
 * - If they're the first user, they become ADMIN (bootstrap flow)
 *
 * @see docs/EMAIL_GATING.md for full documentation
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",

  // Trust the host header on Vercel (required when NEXTAUTH_URL is not set)
  // This allows preview deployments to auto-detect their URL
  trustHost: true,

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],

  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login/error",
  },

  callbacks: {
    async session({ session, user }) {
      // Add user id and role to session
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error - we'll add role to the session type
        session.user.role = user.role;
      }
      return session;
    },

    async signIn({ user, account, email }) {
      // Gate only for verification requests (before magic link email is sent)
      // This prevents unapproved emails from receiving magic links
      if (account?.provider === "resend" && email?.verificationRequest) {
        const userEmail = user.email?.toLowerCase();
        if (!userEmail) return "/login/not-approved";

        // Allow first user (bootstrap case - empty database)
        const userCount = await prisma.user.count();
        if (userCount === 0) return true;

        // Allow existing users
        const existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
        });
        if (existingUser) return true;

        // Allow users with valid (non-expired, unused) invitations
        const invitation = await prisma.invitation.findFirst({
          where: {
            email: userEmail,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
        });
        if (invitation) return true;

        // Email is not approved - redirect to rejection page
        return "/login/not-approved";
      }

      // Allow all other sign-in attempts (e.g., clicking the magic link)
      return true;
    },
  },

  events: {
    async createUser({ user }) {
      const userEmail = user.email?.toLowerCase();

      // Find and consume invitation if one exists
      const invitation = userEmail
        ? await prisma.invitation.findFirst({
            where: { email: userEmail, usedAt: null },
          })
        : null;

      if (invitation) {
        // Set role from invitation and mark invitation as used
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              role: invitation.role,
              invitedById: invitation.invitedById,
            },
          }),
          prisma.invitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() },
          }),
        ]);
      } else {
        // No invitation - check if this is the first user (bootstrap)
        const userCount = await prisma.user.count();
        if (userCount === 1) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        }
      }
    },
  },
});
