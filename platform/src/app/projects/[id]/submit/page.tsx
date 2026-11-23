import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { getDraftAnswers } from "@/lib/server/repo";
import { missingQuestions, providerFromEnv } from "@/lib/server/assess";
import { questionById } from "@/lib/questions/criteria";
import { ActionForm } from "@/components/forms";
import { Card, Notice, PageTitle } from "@/components/ui";
import { submitAssessmentAction } from "../../../actions/project";

export default async function Submit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project } = await requireProject(id);
  const { t } = await getDict();
  const missing = missingQuestions(getDraftAnswers(project.id));
  const ai = providerFromEnv();
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle sub={project.name}>{t.submit.title}</PageTitle>
      {missing.length ? (
        <Card>
          <Notice kind="warn">{t.submit.missing}</Notice>
          <p className="mb-2 font-semibold">{t.submit.missingList}</p>
          <ul className="space-y-1 text-sm" lang="ar" dir="rtl">
            {missing.map((qid) => (
              <li key={qid}>
                <Link className="text-brand underline" href={`/projects/${project.id}/questions?c=${qid.slice(0, 2)}`}>
                  <span dir="ltr">{qid}</span> — {questionById(qid).text}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <Notice>{t.submit.ready}</Notice>
          <p className="mb-4 text-sm text-muted">{t.submit.aiMode}: <strong>{ai.mode}</strong> ({ai.reason})</p>
          <ActionForm action={submitAssessmentAction} submitLabel={t.submit.run} pendingLabel={t.submit.running}
            errors={{ missing: t.submit.missing, failed: t.common.error, default: t.common.error }}>
            <input type="hidden" name="projectId" value={project.id} />
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
