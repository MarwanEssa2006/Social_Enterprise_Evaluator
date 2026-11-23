import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getDict } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/auth";
import { logoutAction, switchLocaleAction } from "./actions/session";
import { headers } from "next/headers";
import { isDemoMode } from "@/lib/server/mode";

export const metadata: Metadata = {
  title: { default: "Social Enterprise Evaluator", template: "%s · Social Enterprise Evaluator" },
  description: "Evaluate, improve, and track social enterprises with Alan's List of Success.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t, dir } = await getDict();
  const user = await currentUser();
  const path = (await headers()).get("x-pathname") || "/";
  return (
    <html lang={locale} dir={dir} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
        </a>
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-brand">
              <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">✦</span>
              <span>{t.appName}</span>
            </Link>
            <nav aria-label="main" className="flex flex-wrap items-center gap-2 text-sm">
              {user ? (
                <>
                  <Link href="/dashboard" className="rounded-lg px-3 py-2 font-semibold hover:bg-bg">{t.nav.dashboard}</Link>
                  <Link href="/settings" className="rounded-lg px-3 py-2 font-semibold hover:bg-bg">{t.nav.settings}</Link>
                  <form action={logoutAction}>
                    <button className="rounded-lg px-3 py-2 font-semibold hover:bg-bg">{t.nav.logout}</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 font-semibold hover:bg-bg">{t.nav.login}</Link>
                  <Link href="/register" className="rounded-lg bg-brand px-3 py-2 font-semibold text-white">{t.nav.register}</Link>
                </>
              )}
              <form action={switchLocaleAction}>
                <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
                <input type="hidden" name="back" value={path} />
                <button className="rounded-lg border border-line px-3 py-2 font-semibold hover:bg-bg" lang={locale === "ar" ? "en" : "ar"}>
                  {t.nav.language}
                </button>
              </form>
            </nav>
          </div>
        </header>
        {isDemoMode() && (
          <div role="note" className="bg-warn-soft px-4 py-2 text-center text-sm font-semibold text-warn-ink">{t.auth.demoBanner}</div>
        )}
        <main id="main" className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-line bg-surface py-4 text-center text-xs text-muted">
          {t.appName} · Alan&apos;s List of Success · {locale === "ar" ? "منهجية" : "Methodology"} M1.0
        </footer>
      </body>
    </html>
  );
}
