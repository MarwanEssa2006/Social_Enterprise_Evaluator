import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { ActionForm } from "@/components/forms";
import { ProjectFields } from "@/components/project-fields";
import { Card, PageTitle, btn } from "@/components/ui";
import { archiveProjectAction, updateProjectAction } from "../../../actions/project";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project } = await requireProject(id);
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle sub={project.name}>{t.project.editTitle}</PageTitle>
      <Card>
        <ActionForm action={updateProjectAction} submitLabel={t.project.save} errors={{ validation: t.auth.errValidation, default: t.common.error }}>
          <input type="hidden" name="projectId" value={project.id} />
          <ProjectFields t={t} p={project} />
        </ActionForm>
      </Card>
      <form action={archiveProjectAction} className="mt-6">
        <input type="hidden" name="projectId" value={project.id} />
        <input type="hidden" name="archive" value={project.archived ? "0" : "1"} />
        <button className={btn.danger}>{project.archived ? t.project.unarchive : t.project.archive}</button>
      </form>
    </div>
  );
}
