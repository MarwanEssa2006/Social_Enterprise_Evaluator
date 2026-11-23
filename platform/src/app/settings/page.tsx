import { getDict } from "@/lib/i18n/server";
import { requireUser } from "@/lib/server/auth";
import { ActionForm } from "@/components/forms";
import { Card, Field, PageTitle, inputCls } from "@/components/ui";
import { changePasswordAction, updateProfileAction } from "../actions/session";

export const metadata = { title: "Account" };

export default async function Settings() {
  const user = await requireUser();
  const { t } = await getDict();
  const S = t.settings;
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle sub={user.email}>{S.title}</PageTitle>
      <Card>
        <h2 className="mb-4 font-bold">{S.profile}</h2>
        <ActionForm action={updateProfileAction} submitLabel={S.save} ok={S.changed} errors={{ validation: t.auth.errValidation, default: t.common.error }}>
          <Field label={t.auth.name} htmlFor="name"><input id="name" name="name" defaultValue={user.name} required minLength={2} maxLength={100} className={inputCls} /></Field>
          <Field label={S.language} htmlFor="locale">
            <select id="locale" name="locale" defaultValue={user.locale} className={inputCls}><option value="ar">العربية</option><option value="en">English</option></select>
          </Field>
        </ActionForm>
      </Card>
      <Card className="mt-4">
        <h2 className="mb-4 font-bold">{S.passwordTitle}</h2>
        <ActionForm action={changePasswordAction} submitLabel={S.save} ok={S.changed} errors={{ current: S.errCurrent, validation: t.auth.errValidation, default: t.common.error }}>
          <Field label={S.current} htmlFor="current"><input id="current" name="current" type="password" required autoComplete="current-password" className={inputCls} dir="ltr" /></Field>
          <Field label={S.newPw} htmlFor="next" hint={t.auth.passwordHint}><input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" className={inputCls} dir="ltr" /></Field>
        </ActionForm>
      </Card>
    </div>
  );
}
