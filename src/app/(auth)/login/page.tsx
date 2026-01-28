import { Suspense } from "react";
import LoginForm from "./LoginForm";

/**
 * Login Page
 *
 * Wraps LoginForm in Suspense because it uses useSearchParams(),
 * which requires a Suspense boundary for static page generation.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Family History
            </h1>
            <p className="text-gray-600">
              Sign in to preserve and share your family stories
            </p>
          </div>

          {/* Login Form - wrapped in Suspense for useSearchParams */}
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          {/* Info */}
          <p className="mt-6 text-center text-sm text-gray-500">
            We&apos;ll send you a magic link to sign in. No password needed!
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Preserving memories for generations to come
        </p>
      </div>
    </div>
  );
}
