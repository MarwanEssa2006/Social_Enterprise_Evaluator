import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/auth";
import { AuthForm } from "@/components/forms";
import { loginAction } from "../actions/session";
import { Card, Notice } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">{t.auth.loginTitle}</h1>
      <Notice kind="warn">{t.auth.testDataNotice}</Notice>
      <Card>
        <AuthForm action={loginAction} mode="login" t={t.auth} />
      </Card>
      <p className="mt-4 text-sm text-muted">
        {t.auth.noAccount} <Link href="/register" className="font-semibold text-brand">{t.nav.register}</Link>
      </p>
    </div>
  );
}
