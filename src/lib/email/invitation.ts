/**
 * Invitation Email Template
 *
 * Sends a branded HTML email inviting someone to join the Family History app.
 * Uses Resend for delivery.
 *
 * Email includes:
 * - Warm welcome message with inviter's name
 * - Prominent "Accept Invitation" CTA button
 * - Fallback text link for email clients that block buttons
 * - Expiration date warning
 * - Plain text alternative for accessibility
 *
 * @see docs/EMAIL_GATING.md for the full invitation flow
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parameters for sending an invitation email.
 */
interface SendInvitationEmailParams {
  /** Recipient email address */
  to: string;
  /** Full URL to the invitation landing page (e.g., https://app.com/invite/abc123) */
  inviteUrl: string;
  /** Name of the admin who sent the invitation (for personalization) */
  inviterName?: string | null;
  /** Role being granted: ADMIN, MEMBER, or VIEWER */
  role: string;
  /** When the invitation expires */
  expiresAt: Date;
}

/**
 * Send an invitation email using Resend.
 *
 * @param params - Email parameters
 * @returns Resend API response data
 * @throws Error if email fails to send
 *
 * @example
 * await sendInvitationEmail({
 *   to: "cousin@example.com",
 *   inviteUrl: "https://family.app/invite/abc123",
 *   inviterName: "Grandma Rose",
 *   role: "MEMBER",
 *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
 * });
 */
export async function sendInvitationEmail({
  to,
  inviteUrl,
  inviterName,
  role,
  expiresAt,
}: SendInvitationEmailParams) {
  // English text
  const inviterTextEn = inviterName ? `${inviterName} has` : "A family member has";
  const roleTextEn = role === "ADMIN" ? "administrator" : role.toLowerCase();
  const expiresTextEn = expiresAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Chinese text
  const inviterTextZh = inviterName ? `${inviterName}` : "一位家族成員";
  const roleTextZh =
    role === "ADMIN" ? "管理員" : role === "MEMBER" ? "成員" : "檢視者";
  const expiresTextZh = expiresAt.toLocaleDateString("zh-TW", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "You're invited to join our Family History | 邀請您加入我們的家族歷史",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #92400e; margin: 0 0 8px; font-size: 28px;">Family History | 家族歷史</h1>
            <p style="color: #b45309; margin: 0; font-size: 14px;">Preserving memories for generations | 為後代珍藏回憶</p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">You're Invited!</h2>

            <p style="margin: 0 0 16px;">
              ${inviterTextEn} invited you to join our family history app as a <strong>${roleTextEn}</strong>.
            </p>

            <p style="margin: 0 0 24px;">
              Click the button below to accept your invitation and start exploring and contributing to our shared family memories.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Accept Invitation | 接受邀請
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; padding-top: 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">您已受邀！</h2>

              <p style="margin: 0 0 16px;">
                ${inviterTextZh}邀請您以<strong>${roleTextZh}</strong>身份加入我們的家族歷史應用程式。
              </p>

              <p style="margin: 0 0 24px;">
                點擊上方按鈕接受邀請，開始探索並為我們共同的家族回憶做出貢獻。
              </p>
            </div>

            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
              Or copy and paste this link into your browser | 或複製並貼上此連結到您的瀏覽器：
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; word-break: break-all; color: #d97706;">
              ${inviteUrl}
            </p>

            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">
                <strong>Note:</strong> This invitation expires on ${expiresTextEn}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>注意：</strong>此邀請將於${expiresTextZh}過期。如果您沒有預期收到此邀請，可以安全地忽略此郵件。
              </p>
            </div>
          </div>

          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            This is an automated email from Family History App.<br/>
            這是來自家族歷史應用程式的自動郵件。
          </p>
        </body>
      </html>
    `,
    text: `
You're Invited to Family History! | 邀請您加入家族歷史！

${inviterTextEn} invited you to join our family history app as a ${roleTextEn}.
${inviterTextZh}邀請您以${roleTextZh}身份加入我們的家族歷史應用程式。

Click this link to accept your invitation | 點擊此連結接受邀請:
${inviteUrl}

This invitation expires on ${expiresTextEn}.
此邀請將於${expiresTextZh}過期。

If you didn't expect this invitation, you can safely ignore this email.
如果您沒有預期收到此邀請，可以安全地忽略此郵件。
    `.trim(),
  });

  if (error) {
    console.error("Failed to send invitation email:", error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  return data;
}
