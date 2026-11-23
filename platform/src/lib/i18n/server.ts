import "server-only";
import { cookies } from "next/headers";
import { DICTS, type Locale } from "./dict";

export const LOCALE_COOKIE = "sev_locale";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "en" ? "en" : "ar"; // Arabic default (TD-07)
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: DICTS[locale], dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const) };
}
