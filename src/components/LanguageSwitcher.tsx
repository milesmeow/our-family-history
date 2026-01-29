"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useLocale } from "@/i18n/client";
import type { Locale } from "@/i18n/config";

/**
 * A bilingual language switcher that displays both language options
 * so users can understand it regardless of current language setting.
 *
 * Shows: "English | 繁體中文" with the current language highlighted
 */
export function LanguageSwitcher() {
  const currentLocale = useNextIntlLocale() as Locale;
  const { setLocale, isPending } = useLocale();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="w-4 h-4 text-gray-500" />
      <button
        onClick={() => setLocale("en")}
        disabled={isPending || currentLocale === "en"}
        className={`transition-colors ${
          currentLocale === "en"
            ? "text-amber-600 font-medium"
            : "text-gray-500 hover:text-gray-700"
        } disabled:cursor-default`}
      >
        English
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLocale("zh-TW")}
        disabled={isPending || currentLocale === "zh-TW"}
        className={`transition-colors ${
          currentLocale === "zh-TW"
            ? "text-amber-600 font-medium"
            : "text-gray-500 hover:text-gray-700"
        } disabled:cursor-default`}
      >
        繁體中文
      </button>
    </div>
  );
}
