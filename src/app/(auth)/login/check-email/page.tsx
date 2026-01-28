import Link from "next/link";
import { Mail } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-amber-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 mb-6">
            We've sent you a magic link to sign in. Click the link in your email
            to continue.
          </p>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 mb-6">
            <p className="font-medium text-gray-700 mb-2">Didn't receive it?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>The link expires in 24 hours</li>
            </ul>
          </div>

          {/* Back link */}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            ← Try a different email
          </Link>
        </div>
      </div>
    </div>
  );
}
