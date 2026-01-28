import Link from "next/link";
import { AlertCircle } from "lucide-react";

// NextAuth error codes and their user-friendly messages
const errorMessages: Record<string, string> = {
  Configuration: "There's an issue with the server configuration.",
  AccessDenied: "You don't have permission to sign in.",
  Verification: "The magic link has expired or was already used.",
  Default: "An unexpected error occurred.",
  EmailSignin: "There was a problem sending the magic link email. This often happens when using Resend's test domain (onboarding@resend.dev) with an email that isn't the Resend account owner.",
  EmailCreateAccount: "Could not create account with this email.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorCode = params.error || "Default";
  const errorMessage = errorMessages[errorCode] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>

          {/* Error code for debugging */}
          {errorCode !== "Default" && (
            <p className="text-xs text-gray-400 mb-4">
              Error code: {errorCode}
            </p>
          )}

          {/* Suggestions */}
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 mb-6">
            <p className="font-medium mb-2">Things to try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Request a new magic link</li>
              <li>Check your spam folder</li>
              <li>Make sure you're using the email linked to your Resend account (when using test domain)</li>
            </ul>
          </div>

          {/* Try again */}
          <Link
            href="/login"
            className="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}
