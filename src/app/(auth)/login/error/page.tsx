import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
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
          <p className="text-gray-600 mb-6">
            We couldn't sign you in. This might happen if:
          </p>

          {/* Reasons */}
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 mb-6">
            <ul className="list-disc list-inside space-y-1">
              <li>The magic link has expired</li>
              <li>The link was already used</li>
              <li>There was a problem with your email</li>
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
