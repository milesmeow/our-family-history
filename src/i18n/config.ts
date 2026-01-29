// Internationalization Configuration
// Supports English and Traditional Chinese (zh-TW)

export const locales = ["en", "zh-TW"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-TW": "繁體中文",
};

// Cookie name for locale preference (shared between client and server)
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
