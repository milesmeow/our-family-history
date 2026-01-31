"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/actions/auth";
import { Mail } from "lucide-react";

/**
 * Forgot Password Form Component
 *
 * Client component that handles password reset requests.
 * Always shows success message (no user enumeration).
 */
export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    null
  );

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <Mail className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("title")}
        </h2>
        <p className="text-gray-600 text-sm">{t("description")}</p>
      </div>

      {state?.success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            {t("success")}
          </div>
          <p className="text-sm text-gray-600 text-center">
            {t("checkEmail")}
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t("sending")}
              </span>
            ) : (
              t("submitButton")
            )}
          </button>
        </form>
      )}
    </div>
  );
}
