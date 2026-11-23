import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { requireProject } from "@/lib/server/auth";
import { getDraftAnswers, listEvidence } from "@/lib/server/repo";
import { CRITERIA, CRITERION_IDS, REQUIRED_QUESTION_IDS, questionsFor } from "@/lib/questions/criteria";
import { SERVICE_USER_NA } from "@/lib/scoring/methodology";
import { EVIDENCE_KINDS, evidenceKind } from "@/lib/evidence/kinds";
import { ActionForm, EvidenceKindSelect } from "@/components/forms";
import { Badge, Card, Field, Notice, PageTitle, ProgressBar, btn, inputCls } from "@/components/ui";
import { addEvidenceAction, deleteEvidenceAction, saveAnswersAction } from "../../../actions/project";

export default async function Questions({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ c?: string; saved?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { project } = await requireProject(id);
  const { t, locale } = await getDict();
  const cid = (CRITERION_IDS as readonly string[]).includes(sp.c ?? "") ? sp.c! : "C1";
  const idx = CRITERION_IDS.indexOf(cid as never);
  const meta = CRITERIA[idx];
  const answers = getDraftAnswers(project.id);
  const answeredTotal = REQUIRED_QUESTION_IDS.filter((q) => answers[q] !== undefined).length;
  const evidence = listEvidence(project.id).filter((e) => e.criterion === cid);
  const socialNa = project.beneficiary_model === "service_users" && (SERVICE_USER_NA as readonly string[]).includes(cid);
  const qs = questionsFor(cid);
  const next = CRITERION_IDS[idx + 1];
  const prev = CRITERION_IDS[idx - 1];
  const name = (c: (typeof CRITERIA)[number]) => (locale === "ar" ? c.nameAr : `${c.nameEn} — ${c.nameAr}`);

  const groups: { key: string; label: string; tone: "com" | "soc" | "neutral"; items: typeof qs }[] = [
    { key: "commercial", label: t.q.commercial, tone: "com", items: qs.filter((q) => q.dimension === "commercial") },
    { key: "social", label: t.q.social, tone: "soc", items: qs.filter((q) => q.dimension === "social") },
    { key: "evidence", label: t.q.evidenceQ, tone: "neutral", items: qs.filter((q) => q.dimension === "evidence") },
  ];

  return (
    <div>
      <PageTitle sub={project.name}>{t.q.title}</PageTitle>
      <div className="mb-4"><ProgressBar value={answeredTotal} max={REQUIRED_QUESTION_IDS.length} label={t.overview.answered} /></div>
      <nav aria-label={t.res.criteria} className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {CRITERIA.map((c, i) => {
          const done = questionsFor(c.id).every((q) => answers[q.id] !== undefined);
          return (
            <Link key={c.id} href={`/projects/${project.id}/questions?c=${c.id}`} aria-current={c.id === cid ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold ${c.id === cid ? "border-brand bg-brand text-white" : "border-line bg-surface hover:bg-bg"}`}>
              {i + 1}. {locale === "ar" ? c.nameAr : c.nameEn} {done ? "✓" : ""}
            </Link>
          );
        })}
      </nav>
      {sp.saved && <Notice kind="success">{t.q.saved}{answeredTotal === REQUIRED_QUESTION_IDS.length ? ` ${t.q.allDone}` : ""}</Notice>}
      <Notice>{t.q.unknownNote} {locale === "en" ? t.q.arabicNote : ""}</Notice>

      <form action={saveAnswersAction}>
        <input type="hidden" name="projectId" value={project.id} />
        <input type="hidden" name="current" value={cid} />
        <Card>
          <h2 className="mb-4 text-xl font-bold">{idx + 1}. {name(meta)}</h2>
          {groups.filter((g) => g.items.length).map((g) => (
            <fieldset key={g.key} className="mb-6">
              <legend className="mb-3"><Badge tone={g.tone}>{g.label}</Badge></legend>
              {g.key === "social" && socialNa && <Notice kind="warn">{t.q.na}</Notice>}
              {g.items.map((q) => (
                <fieldset key={q.id} className="mb-5 rounded-lg border border-line p-4" lang="ar" dir="rtl">
                  <legend className="px-1 font-semibold leading-relaxed">
                    <span className="text-xs text-muted" dir="ltr">{q.id}</span> {q.text}
                  </legend>
                  <div className="mt-2 grid gap-2">
                    {q.options.map((o, k) => (
                      <label key={o.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white px-3 py-2 hover:bg-bg has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                        <input type="radio" name={`q:${q.id}`} value={k} defaultChecked={answers[q.id] === k} className="mt-1.5" />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2">
            {prev && <button name="next" value={prev} className={btn.secondary}>{t.q.prev}</button>}
            <button name="next" value={cid} className={btn.secondary}>{t.q.save}</button>
            {next ? (
              <button name="next" value={next} className={btn.primary}>{t.q.next}</button>
            ) : (
              <button name="next" value="submit" className={btn.primary}>{t.overview.submit}</button>
            )}
          </div>
        </Card>
      </form>

      <Card className="mt-6">
        <h2 id="evidence" className="mb-1 text-lg font-bold">{t.ev.title} — {locale === "ar" ? meta.nameAr : meta.nameEn}</h2>
        <p className="mb-4 text-sm text-muted">{t.ev.hint}</p>
        {evidence.length === 0 ? (
          <p className="mb-4 text-sm text-muted">{t.ev.none}</p>
        ) : (
          <ul className="mb-4 divide-y divide-line">
            {evidence.map((e) => (
              <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-xs text-muted">
                    <Badge tone={e.dimension === "commercial" ? "com" : "soc"}>{t.dims[e.dimension]}</Badge>{" "}
                    {locale === "ar" ? evidenceKind(e.kind)?.ar : evidenceKind(e.kind)?.en} · {evidenceKind(e.kind)?.cls}
                    {e.numeric_value ? ` · ${e.numeric_value.toLocaleString()}` : ""}
                  </div>
                  {e.description && <p className="mt-1 text-sm">{e.description}</p>}
                  {e.file_name && <a className={btn.link + " text-sm"} href={`/projects/${project.id}/files/evidence/${e.id}`}>{t.ev.download}: {e.file_name}</a>}
                </div>
                <form action={deleteEvidenceAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="evidenceId" value={e.id} />
                  <input type="hidden" name="current" value={cid} />
                  <button className={btn.danger}>{t.ev.remove}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <details>
          <summary className={`${btn.secondary} cursor-pointer list-none`}>+ {t.ev.add}</summary>
          <div className="mt-4">
            <ActionForm action={addEvidenceAction} submitLabel={t.ev.add} encType errors={{ validation: t.auth.errValidation, file: t.ev.errFile, default: t.common.error }} ok={t.q.saved}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="criterion" value={cid} />
              <Field label={t.ev.dimension} htmlFor="dimension">
                <select id="dimension" name="dimension" className={inputCls}>
                  <option value="commercial">{t.dims.commercial}</option>
                  {!socialNa && <option value="social">{t.dims.social}</option>}
                </select>
              </Field>
              <EvidenceKindSelect label={t.ev.kind} numberLabel={t.ev.number} kinds={EVIDENCE_KINDS.map((k) => ({ id: k.id, label: `${locale === "ar" ? k.ar : k.en} (${k.cls})` }))} />
              <Field label={t.ev.titleF} htmlFor="title"><input id="title" name="title" required minLength={2} maxLength={200} className={inputCls} /></Field>
              <Field label={t.ev.description} htmlFor="description"><textarea id="description" name="description" rows={3} maxLength={2000} className={inputCls} /></Field>
              <Field label={t.ev.file} htmlFor="file"><input id="file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.csv,.txt" className="text-sm" /></Field>
            </ActionForm>
          </div>
        </details>
      </Card>
    </div>
  );
}
