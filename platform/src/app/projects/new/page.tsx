import { getDict } from "@/lib/i18n/server";
import { requireUser } from "@/lib/server/auth";
import { ActionForm } from "@/components/forms";
import { ProjectFields } from "@/components/project-fields";
import { Card, Notice, PageTitle } from "@/components/ui";
import { createProjectAction } from "../../actions/project";

export const metadata = { title: "New project" };

export default async function NewProject() {
  await requireUser();
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>{t.project.newTitle}</PageTitle>
      <Notice kind="warn">{t.auth.testDataNotice}</Notice>
      <Card>
        <ActionForm action={createProjectAction} submitLabel={t.project.create} errors={{ validation: t.auth.errValidation, default: t.common.error }}>
          <ProjectFields t={t} />
        </ActionForm>
      </Card>
    </div>
  );
}
