import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { listAssessments, listRecommendations } from "@/lib/server/repo";
import { fmtDate, recContent, recText, viewAssessment } from "@/lib/server/views";
import { compareAssessments } from "@/lib/scoring/compare";
import { CRITERIA } from "@/lib/questions/criteria";
import { Badge, Card, PageTitle, btn, inputCls } from "@/components/ui";

function Chart({ points, labels }: { points: { v: number; c: number | null; s: number | null }[]; labels: { com: string; soc: string; title: string } }) {
  const W = 600, H = 220, P = 36;
  const x = (i: number) => P + (points.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (points.length - 1));
  const y = (s: number) => H - P - ((s - 1) / 4) * (H - 2 * P);
  const path = (k: "c" | "s") => points.map((p, i) => (p[k] === null ? null : `${x(i)},${y(p[k]!)}`)).filter(Boolean).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={labels.title}>
        {[1, 2, 3, 4, 5].map((s) => (
          <g key={s}><line x1={P} x2={W - P} y1={y(s)} y2={y(s)} stroke="#dfe3e8" /><text x={P - 8} y={y(s) + 4} fontSize="11" textAnchor="end" fill="#5b6673">{s}</text></g>
        ))}
        <polyline points={path("c")} fill="none" stroke="var(--com)" strokeWidth="3" />
        <polyline points={path("s")} fill="none" stroke="var(--soc)" strokeWidth="3" strokeDasharray="6 4" />
        {points.map((p, i) => (
          <g key={p.v}>
            {p.c !== null && <circle cx={x(i)} cy={y(p.c)} r="5" fill="var(--com)" />}
            {p.s !== null && <circle cx={x(i)} cy={y(p.s)} r="5" fill="var(--soc)" />}
            <text x={x(i)} y={H - 10} fontSize="11" textAnchor="middle" fill="#5b6673">v{p.v}</text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="inline-block h-1 w-5 bg-com" />{labels.com}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1 w-5 border-t-2 border-dashed border-soc" />{labels.soc}</span>
      </figcaption>
    </figure>
  );
}

export default async function Progress({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string; to?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { project } = await requireProject(id);
  const { t, locale } = await getDict();
  const rows = listAssessments(project.id);
  const views = rows.map(viewAssessment);
  if (views.length === 0) {
    return (<div><PageTitle sub={project.name}>{t.prog.title}</PageTitle><Card><p className="text-muted">{t.prog.needTwo}</p></Card></div>);
  }
  const first = views[0], last = views[views.length - 1];
  const fromV = Number(sp.from ?? (views.length > 1 ? views[views.length - 2].row.version : first.row.version));
  const toV = Number(sp.to ?? last.row.version);
  const A = views.find((x) => x.row.version === fromV) ?? first;
  const B = views.find((x) => x.row.version === toV) ?? last;
  const cmp = views.length > 1 ? compareAssessments({ version: A.row.version, input: A.input, result: A.result }, { version: B.row.version, input: B.input, result: B.result }) : null;
  const name = (cid: string) => { const m = CRITERIA.find((c) => c.id === cid)!; return locale === "ar" ? m.nameAr : m.nameEn; };
  const prevRecs = views.length > 1 ? listRecommendations(views[views.length - 2].row.id) : [];
  const delta = (a: string | null, b: string | null) => (a && b ? (Number(b) - Number(a)).toFixed(1) : "—");
  return (
    <div>
      <PageTitle sub={project.name}>{t.prog.title}</PageTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {(["commercial", "social"] as const).map((d) => (
          <Card key={d}>
            <div className={`text-sm font-bold ${d === "commercial" ? "text-com" : "text-soc"}`}>{t.dims[d]}</div>
            <div className="mt-2 grid grid-cols-3 text-center">
              <div><div className="text-xs text-muted">{t.prog.initial}</div><div className="text-2xl font-bold">{first.result[d].display ?? "—"}</div></div>
              <div><div className="text-xs text-muted">{t.prog.latest}</div><div className="text-2xl font-bold">{last.result[d].display ?? "—"}</div></div>
              <div><div className="text-xs text-muted">{t.prog.change}</div><div className="text-2xl font-bold">{delta(first.result[d].display, last.result[d].display)}</div></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">{t.prog.chart}</h2>
        <Chart points={views.map((x) => ({ v: x.row.version, c: x.result.commercial.mean, s: x.result.social.mean }))} labels={{ com: t.dims.commercial, soc: t.dims.social, title: t.prog.chart }} />
        <p className="mt-2 text-xs text-muted">{locale === "ar" ? "النقاط الغائبة تعني أن الدرجة الإجمالية غير مُقيَّمة في ذلك الإصدار." : "Missing points mean the overall score was Not Scored in that version."}</p>
      </Card>
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">{t.prog.criterionChanges}</h2>
        {!cmp ? <p className="text-muted">{t.prog.needTwo}</p> : (
          <>
            <form className="mb-4 flex flex-wrap items-end gap-2" method="get">
              <label className="text-sm font-semibold">{t.prog.from}<select name="from" defaultValue={A.row.version} className={`${inputCls} mt-1`}>{views.map((x) => <option key={x.row.version} value={x.row.version}>v{x.row.version}</option>)}</select></label>
              <label className="text-sm font-semibold">{t.prog.to}<select name="to" defaultValue={B.row.version} className={`${inputCls} mt-1`}>{views.map((x) => <option key={x.row.version} value={x.row.version}>v{x.row.version}</option>)}</select></label>
              <button className={btn.secondary}>{t.prog.compareBtn}</button>
            </form>
            <p className="mb-2 text-sm">{t.res.classification}: <strong>{t.classes[cmp.classification.from as keyof typeof t.classes][0]}</strong> → <strong>{t.classes[cmp.classification.to as keyof typeof t.classes][0]}</strong></p>
            {cmp.methodologyChanged && <p className="mb-2 text-sm"><Badge tone="warn">{t.prog.cause.methodology_change}</Badge> {A.row.methodology_version} → {B.row.methodology_version}</p>}
            {cmp.changes.length === 0 ? <p className="text-muted">{t.prog.noChanges}</p> : (
              <ul className="divide-y divide-line">
                {cmp.changes.map((ch) => (
                  <li key={ch.criterion + ch.dimension} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span><Badge tone={ch.dimension === "commercial" ? "com" : "soc"}>{t.dims[ch.dimension]}</Badge> {name(ch.criterion)}: <strong>{ch.from ?? t.res.notScored}</strong> → <strong>{ch.to ?? t.res.notScored}</strong></span>
                    <Badge tone={ch.cause === "project_change" ? "brand" : "warn"}>{t.prog.cause[ch.cause]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
      {prevRecs.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 font-bold">{t.prog.prevRecs} (v{views[views.length - 2].row.version})</h2>
          <ul className="divide-y divide-line text-sm">
            {prevRecs.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{recText(recContent(r), locale).title}</span><Badge>{t.recs.statuses[r.status as "completed"]}</Badge></li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">{t.prog.history}</h2>
        <ul className="divide-y divide-line text-sm">
          {[...views].reverse().map((x) => (
            <li key={x.row.id} className="flex flex-wrap justify-between gap-2 py-2">
              <a className="font-semibold text-brand hover:underline" href={`/projects/${project.id}/assessments/${x.row.version}`}>v{x.row.version} · {t.classes[x.result.classification.key][0]}</a>
              <span className="text-muted">{t.res.commercial} {x.result.commercial.display ?? "—"} · {t.res.social} {x.result.social.display ?? "—"} · {x.row.methodology_version} · {fmtDate(x.row.created_at, locale)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
