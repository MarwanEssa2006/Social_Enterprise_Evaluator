import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { latestAssessment, listRecommendationEvidence, listRecommendations } from "@/lib/server/repo";
import { fmtDate, recContent } from "@/lib/server/views";
import { ActionForm } from "@/components/forms";
import { RecommendationBody } from "@/components/rec-card";
import { ButtonLink, Card, Notice, PageTitle, btn, inputCls } from "@/components/ui";
import { addRecommendationEvidenceAction, setRecommendationStatusAction } from "../../../actions/project";

export default async function Recommendations({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project } = await requireProject(id);
  const { t, locale } = await getDict();
  const last = latestAssessment(project.id);
  if (!last) {
    return (
      <div>
        <PageTitle sub={project.name}>{t.recs.title}</PageTitle>
        <Card><p className="mb-4 text-muted">{t.recs.noAssessment}</p><ButtonLink href={`/projects/${project.id}/submit`}>{t.overview.submit}</ButtonLink></Card>
      </div>
    );
  }
  const recs = listRecommendations(last.id);
  const counts = { not_started: 0, in_progress: 0, completed: 0 } as Record<string, number>;
  for (const r of recs) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return (
    <div>
      <PageTitle sub={`${project.name} · ${t.recs.fromVersion} ${last.version}`}>{t.recs.title}</PageTitle>
      <Notice>{t.recs.completedNote}</Notice>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {(["not_started", "in_progress", "completed"] as const).map((s) => (
          <span key={s} className="rounded-lg border border-line bg-surface px-3 py-1">{t.recs.statuses[s]}: <strong>{counts[s]}</strong></span>
        ))}
      </div>
      <ul className="space-y-4">
        {recs.map((r) => {
          const records = listRecommendationEvidence(r.id);
          return (
            <li key={r.id} id={r.id}>
              <Card>
                <RecommendationBody t={t} c={recContent(r)} locale={locale} priority={r.priority} />
                <form action={setRecommendationStatusAction} className="mt-4 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="recId" value={r.id} />
                  <label className="text-sm font-semibold">
                    {t.recs.status}
                    <select key={`${r.id}-${r.status}`} name="status" defaultValue={r.status} className={`${inputCls} mt-1`}>
                      {(["not_started", "in_progress", "completed"] as const).map((s) => <option key={s} value={s}>{t.recs.statuses[s]}</option>)}
                    </select>
                  </label>
                  <button className={btn.secondary}>{t.recs.update}</button>
                </form>
                {records.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold">{t.recs.records}</h4>
                    <ul className="mt-1 space-y-1 text-sm">
                      {records.map((e) => (
                        <li key={e.id} className="rounded bg-bg px-3 py-2">
                          <span className="text-xs text-muted">{fmtDate(e.created_at, locale)}</span> — {e.note}
                          {e.file_name && <> · <a className={btn.link} href={`/projects/${project.id}/files/rec/${r.id}/${e.id}`}>{e.file_name}</a></>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-brand">+ {t.recs.addEvidence}</summary>
                  <div className="mt-3">
                    <ActionForm action={addRecommendationEvidenceAction} submitLabel={t.recs.noteSave} encType ok={t.settings.changed}
                      errors={{ validation: t.auth.errValidation, file: t.ev.errFile, default: t.common.error }}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="recId" value={r.id} />
                      <label className="mb-3 block text-sm font-semibold">{t.recs.note}<textarea name="note" required minLength={2} maxLength={2000} rows={2} className={`${inputCls} mt-1`} /></label>
                      <label className="mb-3 block text-sm font-semibold">{t.ev.file}<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.csv,.txt" className="mt-1 block text-sm" /></label>
                    </ActionForm>
                  </div>
                </details>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
