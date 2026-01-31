"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { changePassword } from "@/actions/auth";
import { Key, CheckCircle } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * Change Password Form Component
 *
 * Client component that handles password changes for logged-in users.
 * Used both for forced changes (temp passwords) and voluntary changes.
 * Logs user out after successful change (session invalidated).
 */
export default function ChangePasswordForm() {
  const t = useTranslations("auth.changePassword");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(changePassword, null);

  // If successfully changed, show success and log out
  if (state?.success) {
    // Log out after a short delay (session was invalidated server-side)
    setTimeout(async () => {
      await signOut({ redirect: false });
      router.push("/login");
    }, 2000);

    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("successTitle")}
          </h2>
          <p className="text-gray-600 text-sm">{t("successMessage")}</p>
          <p className="text-gray-500 text-xs mt-2">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <Key className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h2>
        <p className="text-gray-600 text-sm">{t("description")}</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("currentPasswordLabel")}
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            placeholder={t("currentPasswordPlaceholder")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("newPasswordLabel")}
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder={t("newPasswordPlaceholder")}
            minLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
          />
          <p className="mt-2 text-xs text-gray-500">{t("passwordHint")}</p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("confirmPasswordLabel")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder={t("confirmPasswordPlaceholder")}
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
              {t("changing")}
            </span>
          ) : (
            t("submitButton")
          )}
        </button>
      </form>
    </div>
  );
}
