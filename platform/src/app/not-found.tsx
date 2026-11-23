import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t, locale } = await getDict();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-muted">{t.common.notFound}</p>
      <Link className="mt-6 inline-block font-semibold text-brand underline" href="/dashboard">{locale === "ar" ? "العودة إلى مشروعاتي" : "Back to my projects"}</Link>
    </div>
  );
}
