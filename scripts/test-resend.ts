/**
 * Test script to verify Resend email configuration
 * Run with: npx tsx scripts/test-resend.ts your-email@example.com
 *
 * Note: If using onboarding@resend.dev, you can only send to
 * the email address registered with your Resend account.
 */

import { config } from "dotenv";
import { Resend } from "resend";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testResendEmail() {
  console.log("🔍 Testing Resend email configuration...\n");

  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const testRecipient = process.argv[2];

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not set in environment");
    process.exit(1);
  }

  if (!emailFrom) {
    console.error("❌ EMAIL_FROM is not set in environment");
    process.exit(1);
  }

  console.log(`📧 From address: ${emailFrom}`);

  if (!testRecipient) {
    console.log("\n⚠️  No recipient specified. Checking API key validity only...\n");

    try {
      const resend = new Resend(apiKey);
      // Try to list domains to verify API key works
      const domains = await resend.domains.list();
      console.log("✅ API key is valid!");
      console.log(`   Domains configured: ${domains.data?.data?.length || 0}`);

      if (emailFrom.includes("@resend.dev")) {
        console.log("\n⚠️  You're using Resend's test domain (onboarding@resend.dev)");
        console.log("   This only sends to your registered Resend email address.");
        console.log("   For production, verify your own domain in Resend.\n");
      }

      console.log("\n📝 To send a test email, run:");
      console.log("   npx tsx scripts/test-resend.ts your-email@example.com\n");
    } catch (error) {
      console.error("❌ API key validation failed:");
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
    return;
  }

  console.log(`📬 Sending test email to: ${testRecipient}`);

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: testRecipient,
      subject: "🧪 Family History App - Test Email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email Successful! 🎉</h1>
          <p>Your Resend configuration is working correctly.</p>
          <p>This email was sent from your Family History App to verify the magic link authentication will work.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br/>
            From: ${emailFrom}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("\n❌ Email send failed:");
      console.error(error);

      if (error.message?.includes("not allowed")) {
        console.log("\n💡 Tip: If using @resend.dev test domain, you can only");
        console.log("   send to the email registered with your Resend account.");
      }
      process.exit(1);
    }

    console.log("\n✅ Test email sent successfully!");
    console.log(`   Email ID: ${data?.id}`);
    console.log(`\n📬 Check your inbox at: ${testRecipient}`);

  } catch (error) {
    console.error("\n❌ Resend test failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testResendEmail();
