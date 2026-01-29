"use client";

import { useTranslations, useLocale as useNextIntlLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useLocale } from "@/i18n/client";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSelector() {
  const t = useTranslations("settings.language");
  const currentLocale = useNextIntlLocale() as Locale;
  const { setLocale, isPending } = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    if (newLocale !== currentLocale) {
      setLocale(newLocale);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        {t("title")}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{t("description")}</p>
      <div>
        <label htmlFor="language-select" className="block text-sm text-gray-500 mb-1">
          {t("label")}
        </label>
        <select
          id="language-select"
          value={currentLocale}
          onChange={handleChange}
          disabled={isPending}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-wait"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {localeNames[locale]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
