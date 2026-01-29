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
      // Custom email template to improve deliverability
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { Resend: ResendClient } = await import("resend");
        const resend = new ResendClient(provider.apiKey);

        const { error } = await resend.emails.send({
          from: provider.from!,
          to: email,
          subject: "Your Family History sign-in link | 您的家族歷史登入連結",
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #92400e; margin: 0 0 8px; font-size: 28px;">Family History | 家族歷史</h1>
                  <p style="color: #b45309; margin: 0; font-size: 14px;">Preserving memories for generations | 為後代珍藏回憶</p>
                </div>
                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
                  <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Sign in to Family History</h2>
                  <p style="margin: 0 0 24px;">Click the button below to sign in. This link expires in 24 hours.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Sign In | 登入
                    </a>
                  </div>

                  <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; padding-top: 24px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">登入家族歷史</h2>
                    <p style="margin: 0 0 24px;">點擊上方按鈕登入。此連結將於 24 小時後失效。</p>
                  </div>

                  <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Or copy and paste this link | 或複製並貼上此連結：</p>
                  <p style="margin: 0; font-size: 14px; word-break: break-all; color: #d97706;">${url}</p>
                </div>
                <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
                  If you didn't request this email, you can safely ignore it.<br/>
                  如果您沒有請求此郵件，可以安全地忽略它。
                </p>
              </body>
            </html>
          `,
          text: `Sign in to Family History | 登入家族歷史\n\nClick this link to sign in | 點擊此連結登入:\n${url}\n\nThis link expires in 24 hours.\n此連結將於 24 小時後失效。\n\nIf you didn't request this email, you can safely ignore it.\n如果您沒有請求此郵件，可以安全地忽略它。`,
        });

        if (error) {
          throw new Error(`Failed to send verification email: ${error.message}`);
        }
      },
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
