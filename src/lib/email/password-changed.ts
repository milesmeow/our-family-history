/**
 * Password Changed Confirmation Email Template
 *
 * Sends a branded HTML email confirming password change.
 * Uses Resend for delivery.
 *
 * Email includes:
 * - Confirmation that password was changed
 * - Timestamp of change
 * - Security alert if user didn't make the change
 * - Plain text alternative for accessibility
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parameters for sending a password changed confirmation email.
 */
interface SendPasswordChangedEmailParams {
  /** Recipient email address */
  to: string;
  /** Name of the user (if available) */
  name?: string | null;
  /** Timestamp when password was changed */
  changedAt?: Date;
}

/**
 * Send a password changed confirmation email using Resend.
 *
 * @param params - Email parameters
 * @returns Resend API response data
 * @throws Error if email fails to send
 *
 * @example
 * await sendPasswordChangedEmail({
 *   to: "user@example.com",
 *   name: "John Doe",
 *   changedAt: new Date(),
 * });
 */
export async function sendPasswordChangedEmail({
  to,
  name,
  changedAt = new Date(),
}: SendPasswordChangedEmailParams) {
  const greeting = name ? `Hello ${name}` : "Hello";
  const greetingZh = name ? `您好 ${name}` : "您好";

  const timeEn = changedAt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });

  const timeZh = changedAt.toLocaleString("zh-TW", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject:
      "Your password has been changed | 您的密碼已更改",
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
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                ✓ Password Changed Successfully
              </div>
            </div>

            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Password Changed</h2>

            <p style="margin: 0 0 16px;">
              ${greeting},
            </p>

            <p style="margin: 0 0 16px;">
              This email confirms that your password for Family History was successfully changed.
            </p>

            <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
              Changed on: <strong>${timeEn}</strong>
            </p>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; padding-top: 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                  ✓ 密碼已成功更改
                </div>
              </div>

              <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">密碼已更改</h2>

              <p style="margin: 0 0 16px;">
                ${greetingZh}，
              </p>

              <p style="margin: 0 0 16px;">
                此郵件確認您的家族歷史密碼已成功更改。
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
                更改時間：<strong>${timeZh}</strong>
              </p>
            </div>

            <div style="background: #fee2e2; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #991b1b;">
                <strong>Didn't change your password?</strong> If you did not make this change, please contact your family administrator immediately. Your account security may be at risk.
              </p>
              <p style="margin: 0; font-size: 14px; color: #991b1b;">
                <strong>沒有更改您的密碼？</strong>如果您沒有進行此更改，請立即聯絡您的家族管理員。您的帳戶安全可能面臨風險。
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
Password Changed Successfully | 密碼已成功更改

${greeting},
${greetingZh}，

This email confirms that your password for Family History was successfully changed.
此郵件確認您的家族歷史密碼已成功更改。

Changed on: ${timeEn}
更改時間：${timeZh}

Didn't change your password? If you did not make this change, please contact your family administrator immediately.
沒有更改您的密碼？如果您沒有進行此更改，請立即聯絡您的家族管理員。
    `.trim(),
  });

  if (error) {
    console.error("Failed to send password changed email:", error);
    throw new Error(`Failed to send password changed email: ${error.message}`);
  }

  return data;
}
