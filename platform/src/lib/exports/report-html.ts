// PDF report content (TD-20). Renders saved results only — never recalculates (D-11).
import { CRITERIA, questionsFor } from "../questions/criteria";
import { DICTS, type Locale } from "../i18n/dict";
import type { AssessmentResult, DimensionResult } from "../scoring/types";
import type { CriterionAnalysis } from "../ai/schema";
import type { FinalRecommendation } from "../ai/pipeline";
import { FLAG_TEXT } from "../ai/flags";

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface ReportData {
  project: { name: string; description: string; country: string; area: string; beneficiaryModel: string; grantsCoverCosts: boolean };
  version: number;
  methodology: string;
  createdAt: string;
  result: AssessmentResult;
  answers: Record<string, number>;
  analysis: { lang: string; criteria: Record<string, CriterionAnalysis> };
  recommendations: { priority: string; status: string; content: FinalRecommendation }[];
}

export function reportHtml(d: ReportData, locale: Locale): string {
  const t = DICTS[locale];
  const r = d.result;
  const rtl = locale === "ar";
  const recText = (c: FinalRecommendation) => {
    const b = c.base[locale];
    const p = c.personalised && c.personalised.lang === locale ? c.personalised : null;
    return { title: b.title, weakness: p?.weakness ?? b.weakness, why: b.why, action: p?.action ?? b.action, steps: p?.steps ?? b.steps, evidence: p?.expected_evidence ?? b.evidence };
  };
  const chip = (x: DimensionResult) => {
    const cls = x.status === "scored" ? `s${x.score}` : "sn";
    const label = x.status === "scored" ? `${x.score} · ${t.readings[x.reading]}` : x.status === "not_applicable" ? t.res.na : `${t.res.notScored} · ${t.notScoredReasons[(x.reason ?? "unknown") as "unknown"] ?? ""}`;
    return `<span class="chip ${cls}">${esc(label)}</span>`;
  };
  const qual = r.classification.qualifiers
    .map((q) => {
      const [k, v] = q.split(":");
      if (k === "confidence" || k === "methodology") return null;
      const txt = t.qualifiers[k as keyof typeof t.qualifiers];
      return txt ? `${txt}${v ? `: ${v}` : ""}` : null;
    })
    .filter(Boolean);
  const sameLang = d.analysis.lang === locale;
  const overall = (k: "commercial" | "social") => {
    const o = r[k];
    return `<div class="panel ${k}"><div class="ph">${esc(t.dims[k])}</div><div class="big">${esc(o.display ?? "—")}${o.display ? "<small> / 5</small>" : ""}</div>
      ${!o.shown ? `<div class="warn">${esc(t.res.notScoredOverall)}</div>` : ""}
      <div>${esc(t.res.level)}: <b>${esc(t.levels[o.level])}</b></div>
      <div>${esc(t.res.criteriaMet)}: <b>${o.criteriaMet} ${esc(t.common.of)} ${o.scored}</b></div>
      <div>${esc(t.res.coverage)}: <b>${o.scored} ${esc(t.common.of)} ${o.applicable}</b>${o.distribution.na ? ` · ${o.distribution.na} ${esc(t.res.na)}` : ""}</div></div>`;
  };
  const criterionSections = r.criteria
    .map((c, i) => {
      const meta = CRITERIA[i];
      const an = d.analysis.criteria[c.id];
      const recs = d.recommendations.filter((x) => x.content.criterion === c.id);
      return `<section class="crit">
        <h3>${i + 1}. ${esc(locale === "ar" ? meta.nameAr : `${meta.nameEn} — ${meta.nameAr}`)}</h3>
        <table class="dims"><tr><th>${esc(t.dims.commercial)}</th><td>${chip(c.commercial)}</td><th>${esc(t.dims.social)}</th><td>${chip(c.social)}</td><th>${esc(t.res.confidence)}</th><td>${esc(t.confidence[c.confidence])}</td></tr></table>
        <p class="muted">${esc(t.res.outcome)}: ${esc(t.outcomes[c.outcome as keyof typeof t.outcomes])}</p>
        ${sameLang && an ? `<p>${esc(an.summary)}</p><p><b>${esc(t.dims.commercial)}:</b> ${esc(an.commercial_explanation)}</p><p><b>${esc(t.dims.social)}:</b> ${esc(an.social_explanation)}</p>` : ""}
        ${[...c.commercial.flags, ...c.social.flags].length ? `<p class="muted">${esc(t.res.flags)}: ${esc([...new Set([...c.commercial.flags, ...c.social.flags])].map((f) => FLAG_TEXT[f]?.[locale] ?? f).join("؛ "))}</p>` : ""}
        <details open><summary>${esc(t.res.answers)}</summary><ul class="answers" dir="rtl" lang="ar">${questionsFor(c.id)
          .map((q) => `<li><b>${esc(q.id)}</b> ${esc(q.text)}<br/>→ ${esc(d.answers[q.id] !== undefined ? q.options[d.answers[q.id]].text : "—")}</li>`)
          .join("")}</ul></details>
        ${recs.length ? `<h4>${esc(t.res.recs)}</h4>` + recs.map(({ priority, content }) => {
          const x = recText(content);
          return `<div class="rec"><div><span class="pri ${esc(priority)}">${esc(t.priority[priority as "high"])}</span> <span class="dim">${esc(t.dims[content.dimension])}</span> <b>${esc(x.title)}</b></div>
            <p><b>${esc(locale === "ar" ? "نقطة الضعف" : "Weakness")}:</b> ${esc(x.weakness)}</p><p><b>${esc(t.res.why)}:</b> ${esc(x.why)}</p><p><b>${esc(t.res.action)}:</b> ${esc(x.action)}</p>
            <p><b>${esc(t.res.steps)}:</b></p><ol>${x.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
            <p><b>${esc(t.res.evidenceNeeded)}:</b> ${esc(x.evidence.join("، "))}</p>
            <p class="muted">${esc(t.res.related)}: ${esc([...content.relatedQuestions].join(", "))}</p></div>`;
        }).join("") : ""}
      </section>`;
    })
    .join("");
  const next = d.recommendations.filter((x) => x.priority === "high").slice(0, 6);
  const nextList = (next.length ? next : d.recommendations.slice(0, 4)).map((x) => `<li><b>${esc(recText(x.content).title)}</b> — ${esc(recText(x.content).action)}</li>`).join("");
  return `<!doctype html><html lang="${locale}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"/><title>${esc(d.project.name)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif; color: #18212b; font-size: 11pt; line-height: 1.55; }
  h1 { color: #0f6b5c; margin: 0 0 4px; font-size: 22pt; } h2 { color: #0f6b5c; border-bottom: 2px solid #0f6b5c; padding-bottom: 3px; margin-top: 22px; font-size: 15pt; }
  h3 { margin: 0 0 6px; font-size: 13pt; } h4 { margin: 10px 0 4px; }
  .muted { color: #5b6673; font-size: 9.5pt; } .warn { color: #7a4b00; font-weight: 600; }
  .grid { display: flex; gap: 10px; } .panel { flex: 1; border-radius: 8px; padding: 10px; font-size: 10pt; }
  .panel.commercial { background: #e7eefa; } .panel.social { background: #f3eaf8; } .panel.cls { background: #e3f2ef; flex: 1.3; }
  .ph { font-weight: 700; } .big { font-size: 24pt; font-weight: 700; } .big small { font-size: 10pt; color: #5b6673; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dfe3e8; padding: 5px 6px; text-align: start; font-size: 10pt; vertical-align: top; }
  .dims th { background: #f6f7f9; width: 12%; }
  .chip { display: inline-block; border-radius: 6px; padding: 1px 8px; color: #fff; font-weight: 700; font-size: 9.5pt; }
  .s5 { background: #1c7c45; } .s4 { background: #4d8f2f; } .s3 { background: #b07a10; } .s2 { background: #c4561c; } .s1 { background: #b3261e; } .sn { background: #eef0f3; color: #5b6673; }
  .crit { border: 1px solid #dfe3e8; border-radius: 8px; padding: 10px 12px; margin: 10px 0; page-break-inside: avoid; }
  .rec { border-inline-start: 4px solid #0f6b5c; background: #f6f7f9; padding: 6px 10px; margin: 6px 0; page-break-inside: avoid; }
  .rec p { margin: 3px 0; } .pri { border-radius: 10px; padding: 0 8px; font-size: 9pt; font-weight: 700; } .pri.high { background: #fdecea; color: #8a1c14; } .pri.medium { background: #fff7e6; color: #7a4b00; } .pri.low { background: #eef0f3; }
  .dim { font-size: 9pt; color: #5b6673; } .answers { font-size: 9.5pt; } .answers li { margin-bottom: 4px; }
  .badge { display: inline-block; background: #fff7e6; color: #7a4b00; border-radius: 10px; padding: 1px 8px; margin: 2px; font-size: 9pt; }
  details summary { font-weight: 600; }
</style></head><body>
<h1>${esc(t.res.title)}</h1>
<div class="muted">${esc(t.appName)} · ${esc(t.res.version)} ${d.version} · ${esc(t.res.methodology)} ${esc(d.methodology)} · ${esc(new Date(d.createdAt).toLocaleString(locale === "ar" ? "ar-EG" : "en-GB"))}</div>
<h2>${esc(locale === "ar" ? "نظرة عامة على المشروع" : "Project overview")}</h2>
<table><tr><th>${esc(t.project.name)}</th><td>${esc(d.project.name)}</td></tr>
<tr><th>${esc(t.project.description)}</th><td>${esc(d.project.description)}</td></tr>
<tr><th>${esc(t.project.country)} / ${esc(t.project.area)}</th><td>${esc(d.project.country)} — ${esc(d.project.area)}</td></tr>
<tr><th>${esc(t.project.model)}</th><td>${esc(t.project.models[d.project.beneficiaryModel as "workers"] ?? d.project.beneficiaryModel)}</td></tr>
<tr><th>${esc(t.project.grants)}</th><td>${d.project.grantsCoverCosts ? esc(t.common.yes) : esc(t.common.no)}</td></tr></table>
<h2>${esc(locale === "ar" ? "النتائج الإجمالية" : "Overall results")}</h2>
<div class="grid"><div class="panel cls"><div class="ph">${esc(t.res.classification)}</div><div style="font-size:15pt;font-weight:700">${esc(t.classes[r.classification.key][0])}</div><div>${esc(t.classes[r.classification.key][1])}</div>
<div style="margin-top:6px">${qual.map((q) => `<span class="badge">${esc(q)}</span>`).join("")}</div></div>${overall("commercial")}${overall("social")}</div>
<table style="margin-top:10px"><tr><th>${esc(t.res.confidence)}</th><td>${esc(t.confidence[r.confidence.overall])} (${esc(t.dims.commercial)}: ${esc(t.confidence[r.confidence.commercial])} · ${esc(t.dims.social)}: ${esc(t.confidence[r.confidence.social])})</td></tr>
<tr><th>${esc(t.res.completeness)}</th><td>${esc(t.dims.commercial)} ${r.completeness.commercial.known}/${r.completeness.commercial.total} · ${esc(t.dims.social)} ${r.completeness.social.known}/${r.completeness.social.total} ${esc(t.res.known)} · ${esc(t.res.context)} ${r.completeness.context.complete}/${r.completeness.context.total}</td></tr>
<tr><th>${esc(locale === "ar" ? "التغطية الاجتماعية" : "Social Coverage")}</th><td>${r.social.scored} ${esc(t.common.of)} ${r.social.applicable} ${esc(t.res.applicable)} ${esc(t.res.scored)}${r.social.distribution.na ? ` · ${r.social.distribution.na} ${esc(t.res.na)}` : ""}</td></tr></table>
<h2>${esc(t.res.criteria)}</h2>
<table><tr><th>#</th><th>${esc(t.res.criteria)}</th><th>${esc(t.dims.commercial)}</th><th>${esc(t.dims.social)}</th><th>${esc(t.res.confidence)}</th></tr>
${r.criteria.map((c, i) => `<tr><td>${i + 1}</td><td>${esc(locale === "ar" ? CRITERIA[i].nameAr : CRITERIA[i].nameEn)}</td><td>${chip(c.commercial)}</td><td>${chip(c.social)}</td><td>${esc(t.confidence[c.confidence])}</td></tr>`).join("")}</table>
<h2>${esc(t.res.nextActions)}</h2><ol>${nextList}</ol>
<h2>${esc(locale === "ar" ? "تقييم المعايير والتوصيات" : "Criterion assessments and recommendations")}</h2>
${criterionSections}
<p class="muted">${esc(locale === "ar"
    ? "الدرجات يحسبها محرك التقييم وفق المنهجية المعتمدة فقط. النصوص التحليلية لا تغيّر الدرجات. «غير مُقيَّم» يعني معلومات غير معروفة أو متعارضة وليس أداءً ضعيفاً؛ و«لا ينطبق» يعني أن البعد لا يناسب نموذج المستفيدين."
    : "Scores are calculated only by the Scoring Engine under the approved methodology. Written analysis never changes scores. \"Not Scored\" means unknown or conflicting information, not weak performance; \"N/A\" means the dimension does not apply to the beneficiary model.")}</p>
</body></html>`;
}
