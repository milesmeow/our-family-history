"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createUserWithPassword } from "@/actions/auth";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export function CreateAccountSection() {
  const t = useTranslations("settings.createAccount");
  const tCommon = useTranslations("common");

  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(createUserWithPassword, null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {t("title")}
      </h2>
      <p className="text-sm text-gray-600 mb-6">{t("description")}</p>

      <form action={formAction} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("emailLabel")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder={t("emailPlaceholder")}
            disabled={isPending}
          />
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("nameLabel")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder={t("namePlaceholder")}
            disabled={isPending}
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("roleLabel")}
          </label>
          <select
            id="role"
            name="role"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            disabled={isPending}
            defaultValue="MEMBER"
          >
            <option value="MEMBER">{t("roles.MEMBER")}</option>
            <option value="VIEWER">{t("roles.VIEWER")}</option>
            <option value="ADMIN">{t("roles.ADMIN")}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{t("rolesHelp")}</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? t("creating") : t("createButton")}
        </button>

        {/* Success Message */}
        {state?.success && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              {t("success")}
            </p>
            <p className="text-xs text-green-700 mt-1">{t("successDetail")}</p>
          </div>
        )}

        {/* Error Message */}
        {state?.success === false && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">
              {state.error || tCommon("error")}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
