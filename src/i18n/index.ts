import en from "./en";
import it from "./it";

export const translations = { en, it } as const;

export type Locale = keyof typeof translations;

export function useTranslations(locale: Locale) {
  return translations[locale];
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/it") ? "it" : "en";
}
