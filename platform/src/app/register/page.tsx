import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/auth";
import { AuthForm } from "@/components/forms";
import { registerAction } from "../actions/session";
import { Card, Notice } from "@/components/ui";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await currentUser()) redirect("/dashboard");
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">{t.auth.registerTitle}</h1>
      <Notice kind="warn">{t.auth.testDataNotice}</Notice>
      <Card>
        <AuthForm action={registerAction} mode="register" t={t.auth} />
      </Card>
      <p className="mt-4 text-sm text-muted">
        {t.auth.haveAccount} <Link href="/login" className="font-semibold text-brand">{t.nav.login}</Link>
      </p>
    </div>
  );
}
