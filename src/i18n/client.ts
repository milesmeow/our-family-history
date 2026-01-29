"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, LOCALE_COOKIE_NAME, type Locale } from "./config";

// Cookie max age: 1 year
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function useLocale() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: Locale) => {
    // Validate the locale
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`);
      return;
    }

    // Set cookie for server-side reading
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;

    // Also store in localStorage for quick client-side access
    localStorage.setItem(LOCALE_COOKIE_NAME, newLocale);

    // Refresh the page to apply the new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return { setLocale, isPending };
}
