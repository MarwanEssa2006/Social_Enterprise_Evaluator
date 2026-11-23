import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { getAssessment, listRecommendations } from "@/lib/server/repo";
import { fmtDate, recContent, recText, viewAssessment } from "@/lib/server/views";
import { CRITERIA } from "@/lib/questions/criteria";
import { Badge, ButtonLink, Card, PageTitle } from "@/components/ui";
import { ClassificationBanner, DimCell, OverallPanel } from "@/components/results";

export default async function Results({ params }: { params: Promise<{ id: string; v: string }> }) {
  const { id, v } = await params;
  const { project } = await requireProject(id);
  const row = getAssessment(project.id, Number(v));
  if (!row) notFound();
  const { t, locale } = await getDict();
  const a = viewAssessment(row);
  const r = a.result;
  const recs = listRecommendations(row.id).map((x) => ({ row: x, c: recContent(x) }));
  const top = recs.filter((x) => x.row.priority === "high").slice(0, 5);
  const nextActions = top.length ? top : recs.slice(0, 3);
  const base = `/projects/${project.id}/assessments/${row.version}`;
  return (
    <div>
      <PageTitle sub={`${project.name} · ${t.res.version} ${row.version} · ${t.res.methodology} ${row.methodology_version} · ${fmtDate(row.created_at, locale)}`}>{t.res.title}</PageTitle>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <a className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white" href={`${base}/report.pdf`}>{t.res.downloadPdf}</a>
        <a className="inline-flex min-h-10 items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold" href={`${base}/export.xlsx`}>{t.res.downloadXlsx}</a>
        <ButtonLink variant="secondary" href={`/projects/${project.id}/recommendations`}>{t.res.recs}</ButtonLink>
        <ButtonLink variant="secondary" href={`/projects/${project.id}/progress`}>{t.res.compare}</ButtonLink>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1"><ClassificationBanner t={t} r={r} locale={locale} /></div>
        <OverallPanel t={t} o={r.commercial} dim="commercial" />
        <OverallPanel t={t} o={r.social} dim="social" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-muted">{t.res.confidence}</div>
          <div className="text-xl font-bold">{t.confidence[r.confidence.overall]}</div>
          <div className="mt-1 text-xs text-muted">{t.res.commercial}: {t.confidence[r.confidence.commercial]} · {t.res.social}: {t.confidence[r.confidence.social]}</div>
          <div className="mt-1 text-xs text-muted">{(["High", "Moderate", "Low", "StatementOnly"] as const).map((k) => `${t.confidence[k]} ${r.confidence.distribution[k]}`).join(" · ")}</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t.res.completeness}</div>
          <div className="text-xl font-bold">{r.completeness.commercial.known + r.completeness.social.known} / {r.completeness.commercial.total + r.completeness.social.total}</div>
          <div className="mt-1 text-xs text-muted">{t.res.commercial} {r.completeness.commercial.known}/{r.completeness.commercial.total} · {t.res.social} {r.completeness.social.known}/{r.completeness.social.total} {t.res.known}</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t.res.context}</div>
          <div className="text-xl font-bold">{r.completeness.context.complete} / {r.completeness.context.total}</div>
          <div className="mt-1 text-xs text-muted">{t.res.aiStatus}: {t.aiStatus[(Object.values(a.aiMeta.perCriterion)[0]?.status ?? "mock") as keyof typeof t.aiStatus]}</div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-bold">{t.res.criteria}</h2>
        {/* relative: keeps the absolutely positioned sr-only header text inside the scroll container (RTL overflow) */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-start text-muted">
                <th scope="col" className="py-2 text-start">{t.res.criteria}</th>
                <th scope="col" className="py-2 text-start text-com">{t.res.commercial}</th>
                <th scope="col" className="py-2 text-start text-soc">{t.res.social}</th>
                <th scope="col" className="py-2 text-start">{t.res.confidence}</th>
                <th scope="col" className="py-2 text-start"><span className="sr-only">{t.res.details}</span></th>
              </tr>
            </thead>
            <tbody>
              {r.criteria.map((c, i) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 text-start font-semibold">{i + 1}. {locale === "ar" ? CRITERIA[i].nameAr : CRITERIA[i].nameEn}<div className="text-xs font-normal text-muted">{t.outcomes[c.outcome as keyof typeof t.outcomes]}</div></th>
                  <td className="py-3"><DimCell t={t} d={c.commercial} /></td>
                  <td className="py-3"><DimCell t={t} d={c.social} /></td>
                  <td className="py-3">{t.confidence[c.confidence]}</td>
                  <td className="py-3"><Link className="font-semibold text-brand hover:underline" href={`${base}/criteria/${c.id}`}>{t.res.details}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-bold">{t.res.nextActions}</h2>
        <ol className="space-y-3">
          {nextActions.map(({ row: rr, c }) => {
            const txt = recText(c, locale);
            return (
              <li key={rr.id} className="rounded-lg border border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={rr.priority as "high"}>{t.priority[rr.priority as "high"]}</Badge>
                  <Badge tone={c.dimension === "commercial" ? "com" : "soc"}>{t.dims[c.dimension]}</Badge>
                  <span className="font-semibold">{txt.title}</span>
                </div>
                <p className="mt-1 text-sm">{txt.action}</p>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
