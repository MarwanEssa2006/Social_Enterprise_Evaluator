import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { getAssessment, listRecommendations } from "@/lib/server/repo";
import { recContent, viewAssessment } from "@/lib/server/views";
import { CRITERIA, questionsFor } from "@/lib/questions/criteria";
import { FLAG_TEXT } from "@/lib/ai/flags";
import { Badge, Card, PageTitle } from "@/components/ui";
import { DimCell } from "@/components/results";
import { RecommendationBody } from "@/components/rec-card";

export default async function CriterionDetail({ params }: { params: Promise<{ id: string; v: string; c: string }> }) {
  const { id, v, c } = await params;
  const { project } = await requireProject(id);
  const row = getAssessment(project.id, Number(v));
  const meta = CRITERIA.find((x) => x.id === c);
  if (!row || !meta) notFound();
  const { t, locale } = await getDict();
  const a = viewAssessment(row);
  const cr = a.result.criteria.find((x) => x.id === c)!;
  const an = a.analysis.criteria[c];
  const recs = listRecommendations(row.id).filter((r) => r.criterion === c);
  const sameLang = a.analysis.lang === locale;
  const claimList = (title: string, items?: { text: string }[]) =>
    items && items.length ? (
      <div className="mb-3">
        <h3 className="font-semibold">{title}</h3>
        <ul className="list-disc ps-5 text-sm">{items.map((i) => <li key={i.text}>{i.text}</li>)}</ul>
      </div>
    ) : null;
  return (
    <div>
      <Link href={`/projects/${project.id}/assessments/${row.version}`} className="text-sm font-semibold text-brand">← {t.res.backToResults}</Link>
      <PageTitle sub={`${t.res.version} ${row.version} · ${t.outcomes[cr.outcome as keyof typeof t.outcomes]}`}>{locale === "ar" ? meta.nameAr : `${meta.nameEn} — ${meta.nameAr}`}</PageTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {(["commercial", "social"] as const).map((dim) => {
          const d = cr[dim];
          return (
            <Card key={dim}>
              <div className="mb-2 flex items-center justify-between"><Badge tone={dim === "commercial" ? "com" : "soc"}>{t.dims[dim]}</Badge><span className="text-xs text-muted">{t.res.confidence}: {t.confidence[d.confidence]}</span></div>
              <DimCell t={t} d={d} />
              {sameLang && an && <p className="mt-3 text-sm">{dim === "commercial" ? an.commercial_explanation : an.social_explanation}</p>}
              {d.flags.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-muted">{t.res.flags}</div>
                  <ul className="list-disc ps-5 text-xs">{d.flags.map((f) => <li key={f}>{FLAG_TEXT[f]?.[locale] ?? f}</li>)}</ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{t.res.analysis}</h2>
          <Badge>{t.res.aiStatus}: {t.aiStatus[(an?.status ?? "mock") as keyof typeof t.aiStatus]}</Badge>
        </div>
        {an && sameLang ? (
          <>
            <p className="mb-3">{an.summary}</p>
            {claimList(t.res.strengths, an.strengths)}
            {claimList(t.res.weaknesses, an.weaknesses)}
            {claimList(t.res.assumptions, an.unsupported_assumptions)}
            {claimList(t.res.gaps, an.information_gaps)}
          </>
        ) : (
          <p className="text-sm text-muted">{locale === "ar" ? "التحليل النصي محفوظ بلغة التقييم الأصلية." : "The written analysis is stored in the language used at assessment time."} ({a.analysis.lang})</p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-bold">{t.res.answers}</h2>
        <ul className="space-y-3" lang="ar" dir="rtl">
          {questionsFor(c).map((q) => {
            const idx = a.input.answers[q.id];
            return (
              <li key={q.id} className="rounded-lg bg-bg p-3 text-sm">
                <div className="font-semibold"><span className="text-xs text-muted" dir="ltr">{q.id}</span> {q.text}</div>
                <div className="mt-1">{idx !== undefined ? q.options[idx].text : "—"}</div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-bold">{t.res.recs}</h2>
        {recs.length === 0 ? <p className="text-sm text-muted">{t.res.noRecs}</p> : (
          <ul className="space-y-4">{recs.map((r) => <li key={r.id} className="rounded-lg border border-line p-4"><RecommendationBody t={t} c={recContent(r)} locale={locale} priority={r.priority} /></li>)}</ul>
        )}
      </Card>
    </div>
  );
}
