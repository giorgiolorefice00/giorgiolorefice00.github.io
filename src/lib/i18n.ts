export type Locale = "en" | "it";
export type Bil = { en: string; it: string };

export function t(field: Bil | undefined, locale: Locale): string {
  if (!field) return "";
  return field[locale] ?? field.en ?? "";
}
