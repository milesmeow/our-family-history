/**
 * Password Reset Email Template
 *
 * Sends a branded HTML email with password reset link.
 * Uses Resend for delivery.
 *
 * Email includes:
 * - Password reset request confirmation
 * - Prominent reset link (expires in 1 hour)
 * - Security notices
 * - Plain text alternative for accessibility
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parameters for sending a password reset email.
 */
interface SendPasswordResetEmailParams {
  /** Recipient email address */
  to: string;
  /** Full URL to the password reset page with token */
  resetUrl: string;
  /** Name of the user (if available) */
  name?: string | null;
}

/**
 * Send a password reset email with reset link using Resend.
 *
 * @param params - Email parameters
 * @returns Resend API response data
 * @throws Error if email fails to send
 *
 * @example
 * await sendPasswordResetEmail({
 *   to: "user@example.com",
 *   resetUrl: "https://family.app/reset-password/abc123",
 *   name: "John Doe",
 * });
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
}: SendPasswordResetEmailParams) {
  const greeting = name ? `Hello ${name}` : "Hello";
  const greetingZh = name ? `您好 ${name}` : "您好";

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject:
      "Reset your Family History password | 重設您的家族歷史密碼",
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
            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Password Reset Request</h2>

            <p style="margin: 0 0 16px;">
              ${greeting},
            </p>

            <p style="margin: 0 0 16px;">
              We received a request to reset your password for your Family History account. Click the button below to choose a new password.
            </p>

            <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
              This link will expire in <strong>1 hour</strong> for security reasons.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password | 重設密碼
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; padding-top: 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">密碼重設請求</h2>

              <p style="margin: 0 0 16px;">
                ${greetingZh}，
              </p>

              <p style="margin: 0 0 16px;">
                我們收到了重設您家族歷史帳戶密碼的請求。點擊上方按鈕來選擇新密碼。
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
                為了安全起見，此連結將在<strong>1小時</strong>後過期。
              </p>
            </div>

            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
              Or copy and paste this link into your browser | 或複製並貼上此連結到您的瀏覽器：
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; word-break: break-all; color: #d97706;">
              ${resetUrl}
            </p>

            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">
                <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>沒有請求此操作？</strong>如果您沒有請求密碼重設，可以安全地忽略此郵件。您的密碼不會被更改。
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
Password Reset Request | 密碼重設請求

${greeting},
${greetingZh}，

We received a request to reset your password for your Family History account.
我們收到了重設您家族歷史帳戶密碼的請求。

Click this link to reset your password (expires in 1 hour):
點擊此連結重設您的密碼（1小時後過期）：
${resetUrl}

Didn't request this? If you didn't request a password reset, you can safely ignore this email.
沒有請求此操作？如果您沒有請求密碼重設，可以安全地忽略此郵件。
    `.trim(),
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
}
