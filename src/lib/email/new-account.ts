/**
 * New Account Email Template
 *
 * Sends a branded HTML email with temporary password when an admin creates an account.
 * Uses Resend for delivery.
 *
 * Email includes:
 * - Welcome message with temporary password
 * - Prominent password display
 * - Warning to change password on first login
 * - Login link
 * - Plain text alternative for accessibility
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parameters for sending a new account email.
 */
interface SendNewAccountEmailParams {
  /** Recipient email address */
  to: string;
  /** Temporary password (plain text - will be securely displayed) */
  temporaryPassword: string;
  /** Full URL to the login page */
  loginUrl: string;
  /** Name of the new user */
  name: string;
}

/**
 * Send a new account email with temporary password using Resend.
 *
 * @param params - Email parameters
 * @returns Resend API response data
 * @throws Error if email fails to send
 *
 * @example
 * await sendNewAccountEmail({
 *   to: "newuser@example.com",
 *   temporaryPassword: "Temp1234Password",
 *   loginUrl: "https://family.app/login",
 *   name: "John Doe",
 * });
 */
export async function sendNewAccountEmail({
  to,
  temporaryPassword,
  loginUrl,
  name,
}: SendNewAccountEmailParams) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "Your Family History account has been created | 您的家族歷史帳戶已建立",
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
            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">Welcome, ${name}!</h2>

            <p style="margin: 0 0 16px;">
              An administrator has created an account for you on our Family History app. You can now log in and start exploring our shared family memories.
            </p>

            <p style="margin: 0 0 24px;">
              Use the temporary password below to log in. You'll be asked to change it on your first login for security.
            </p>

            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">
                TEMPORARY PASSWORD | 臨時密碼
              </p>
              <p style="margin: 0; font-size: 24px; color: #92400e; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 2px;">
                ${temporaryPassword}
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Log In Now | 立即登入
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0; padding-top: 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">歡迎，${name}！</h2>

              <p style="margin: 0 0 16px;">
                管理員已為您在我們的家族歷史應用程式上建立了帳戶。您現在可以登入並開始探索我們共同的家族回憶。
              </p>

              <p style="margin: 0 0 24px;">
                使用上方的臨時密碼登入。為了安全起見，您將在第一次登入時被要求更改密碼。
              </p>
            </div>

            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
              Or copy and paste this link into your browser | 或複製並貼上此連結到您的瀏覽器：
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; word-break: break-all; color: #d97706;">
              ${loginUrl}
            </p>

            <div style="background: #fee2e2; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #991b1b;">
                <strong>Important:</strong> For security, please change your password immediately after logging in.
              </p>
              <p style="margin: 0; font-size: 14px; color: #991b1b;">
                <strong>重要：</strong>為了安全起見，請在登入後立即更改您的密碼。
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
Welcome to Family History! | 歡迎來到家族歷史！

Hello ${name},
您好 ${name}，

An administrator has created an account for you on our Family History app.
管理員已為您在我們的家族歷史應用程式上建立了帳戶。

Your temporary password is: ${temporaryPassword}
您的臨時密碼是：${temporaryPassword}

Log in here | 在此登入:
${loginUrl}

IMPORTANT: Please change your password immediately after logging in for security.
重要：為了安全起見，請在登入後立即更改您的密碼。

If you didn't expect this email, please contact your family administrator.
如果您沒有預期收到此郵件，請聯絡您的家族管理員。
    `.trim(),
  });

  if (error) {
    console.error("Failed to send new account email:", error);
    throw new Error(`Failed to send new account email: ${error.message}`);
  }

  return data;
}
