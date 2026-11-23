import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { getDraftAnswers, latestAssessment, listAssessments, listEvidence } from "@/lib/server/repo";
import { REQUIRED_QUESTION_IDS } from "@/lib/questions/criteria";
import { Badge, ButtonLink, Card, PageTitle, ProgressBar } from "@/components/ui";
import { fmtDate, viewAssessment } from "@/lib/server/views";

export default async function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project } = await requireProject(id);
  const { t, locale } = await getDict();
  const answers = getDraftAnswers(project.id);
  const answered = REQUIRED_QUESTION_IDS.filter((q) => answers[q] !== undefined).length;
  const total = REQUIRED_QUESTION_IDS.length;
  const evidence = listEvidence(project.id);
  const versions = listAssessments(project.id);
  const last = latestAssessment(project.id);
  const v = last ? viewAssessment(last) : null;
  const O = t.overview;
  return (
    <div>
      <PageTitle sub={[project.country, project.area, t.project.models[project.beneficiary_model]].filter(Boolean).join(" · ")}>{project.name}</PageTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">{O.steps}</h2>
          <ol className="space-y-4">
            <li className="flex flex-wrap items-center justify-between gap-2">
              <span>1. {O.step1}</span>
              <ButtonLink variant="secondary" href={`/projects/${project.id}/edit`}>{O.edit}</ButtonLink>
            </li>
            <li>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>2. {O.step2}</span>
                <ButtonLink variant={answered < total ? "primary" : "secondary"} href={`/projects/${project.id}/questions`}>{O.continue}</ButtonLink>
              </div>
              <div className="mt-2"><ProgressBar value={answered} max={total} label={O.answered} /></div>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2">
              <span>3. {O.step3} — <Badge>{evidence.length}</Badge></span>
              <ButtonLink variant="secondary" href={`/projects/${project.id}/questions?c=C1#evidence`}>{O.evidenceBtn}</ButtonLink>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2">
              <span>4. {O.step4}</span>
              <ButtonLink variant={answered === total ? "primary" : "secondary"} href={`/projects/${project.id}/submit`}>{versions.length ? O.reassess : O.submit}</ButtonLink>
            </li>
          </ol>
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">{O.latest}</h2>
          {v ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">{t.res.version} {v.row.version} · {fmtDate(v.row.created_at, locale)}</p>
              <Badge tone="brand">{t.classes[v.result.classification.key][0]}</Badge>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-com-soft p-3"><div className="text-xs font-semibold text-com">{t.res.commercial}</div><div className="text-2xl font-bold">{v.result.commercial.display ?? "—"}</div></div>
                <div className="rounded-lg bg-soc-soft p-3"><div className="text-xs font-semibold text-soc">{t.res.social}</div><div className="text-2xl font-bold">{v.result.social.display ?? "—"}</div></div>
              </div>
              <div className="flex flex-col gap-2">
                <ButtonLink href={`/projects/${project.id}/assessments/${v.row.version}`}>{O.results}</ButtonLink>
                <ButtonLink variant="secondary" href={`/projects/${project.id}/recommendations`}>{O.recommendations}</ButtonLink>
                <ButtonLink variant="secondary" href={`/projects/${project.id}/progress`}>{O.progress}</ButtonLink>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t.dash.noAssessment}</p>
          )}
        </Card>
      </div>
      {versions.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 font-bold">{t.prog.history}</h2>
          <ul className="divide-y divide-line">
            {[...versions].reverse().map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <Link className="font-semibold text-brand hover:underline" href={`/projects/${project.id}/assessments/${a.version}`}>{t.res.version} {a.version}</Link>
                <span className="text-muted">{a.methodology_version} · {fmtDate(a.created_at, locale)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
