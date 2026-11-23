// Deterministic analysis text. Used by the mock provider (AI_MODE=mock) and as the fallback when the live
// provider fails or its output is rejected. It only restates fact-sheet content; it never invents facts.
import type { CriterionAnalysis } from "./schema";
import type { FactSheet } from "./factsheet";

const READING = {
  en: { Strong: "strong", Adequate: "adequate", Limited: "limited", Weak: "weak", Absent: "absent (the founder states it does not exist yet)", NotYetDetermined: "not yet determined", Undetermined: "unknown", Conflicting: "conflicting answers", NotApplicable: "not applicable to this beneficiary model" },
  ar: { Strong: "قوي", Adequate: "جيد", Limited: "محدود", Weak: "ضعيف", Absent: "غير موجود حالياً (حسب إفادة المؤسس)", NotYetDetermined: "لم يُحدَّد بعد", Undetermined: "غير معروف", Conflicting: "إجابات متعارضة", NotApplicable: "لا ينطبق على نموذج المستفيدين" },
} as const;
const CONF = {
  en: { High: "high", Moderate: "moderate", Low: "low", StatementOnly: "founder statements only", NotAssessable: "not assessable", NotApplicable: "not applicable" },
  ar: { High: "مرتفعة", Moderate: "متوسطة", Low: "منخفضة", StatementOnly: "تصريحات المؤسس فقط", NotAssessable: "غير قابلة للتقييم", NotApplicable: "لا تنطبق" },
} as const;

const POSITIVE = new Set(["strong indication", "positive indication"]);
const NEGATIVE = new Set(["weak or adverse indication", "founder states this does not exist yet"]);
const GAP = new Set(["unknown to the founder (not a negative signal)", "not yet determined by the founder"]);

export function templateAnalysis(sheet: FactSheet): CriterionAnalysis {
  const L = sheet.language;
  const res = (dim: string) => sheet.results.find((r) => r.dimension === dim)!;
  const explain = (dim: "commercial" | "social") => {
    const r = res(dim);
    const reading = READING[L][r.result as keyof (typeof READING)["en"]] ?? r.result;
    const conf = CONF[L][r.evidence_confidence as keyof (typeof CONF)["en"]] ?? r.evidence_confidence;
    if (r.status === "not_applicable") {
      return L === "ar" ? "هذا البعد لا ينطبق على نموذج المستفيدين المسجَّل (مستخدمو خدمة)، ولا يُحتسب ضعفاً." : "This dimension does not apply to the recorded beneficiary model (service users) and is not counted as a weakness.";
    }
    const flags = r.flags.map((f) => f.meaning).join("; ");
    if (L === "ar") {
      return `النتيجة: ${reading}. ثقة الأدلة: ${conf}.` + (r.status === "not_scored" ? " هذا البعد غير مُقيَّم لأن المعلومات غير مكتملة أو متعارضة، وهذا لا يعني ضعف الأداء." : "") + (flags ? ` ملاحظات: ${flags}.` : "");
    }
    return `Result: ${reading}. Evidence confidence: ${conf}.` + (r.status === "not_scored" ? " This dimension is Not Scored because information is incomplete or conflicting; that does not mean weak performance." : "") + (flags ? ` Notes: ${flags}.` : "");
  };
  const applicable = (a: FactSheet["answers"][number]) =>
    a.dimension === "evidence" || res(a.dimension)?.status !== "not_applicable";
  const claim = (a: FactSheet["answers"][number]) => ({
    text: L === "ar" ? `«${a.question}» — إجابتكم: «${a.answer}»` : `"${a.question}" — your answer: "${a.answer}"`,
    source_ids: [a.id],
  });
  const strengths = sheet.answers.filter((a) => applicable(a) && POSITIVE.has(a.meaning)).slice(0, 4).map(claim);
  const weaknesses = sheet.answers.filter((a) => applicable(a) && NEGATIVE.has(a.meaning)).slice(0, 4).map(claim);
  const gaps = sheet.answers.filter((a) => applicable(a) && GAP.has(a.meaning)).slice(0, 4).map(claim);
  const statementOnly = sheet.results.filter((r) => r.evidence_confidence === "StatementOnly" && r.status === "scored");
  const assumptions = statementOnly.slice(0, 4).map((r) => ({
    text: L === "ar"
      ? `نتيجة البعد ${r.dimension === "commercial" ? "التجاري" : "الاجتماعي"} مبنية على تصريحات المؤسس دون دليل داعم بعد.`
      : `The ${r.dimension} result rests on founder statements without supporting evidence yet.`,
    source_ids: [r.id],
  }));
  const name = sheet.criterion.name;
  const summary =
    L === "ar"
      ? `تحليل معيار «${name}»: البعد التجاري ${READING.ar[res("commercial").result as keyof (typeof READING)["ar"]]}، والبعد الاجتماعي ${READING.ar[res("social").result as keyof (typeof READING)["ar"]]}. يُقيَّم كل بعد بشكل مستقل ولا يعوِّض أحدهما ضعف الآخر.`
      : `${name}: the commercial dimension is ${READING.en[res("commercial").result as keyof (typeof READING)["en"]]} and the social dimension is ${READING.en[res("social").result as keyof (typeof READING)["en"]]}. Each dimension is assessed separately; neither compensates for the other.`;
  const firstAnswer = (dim: string) => sheet.answers.find((a) => a.dimension === dim);
  return {
    criterion: sheet.criterion.id,
    summary,
    commercial_explanation: explain("commercial"),
    social_explanation: explain("social"),
    strengths,
    weaknesses,
    unsupported_assumptions: assumptions,
    information_gaps: gaps,
    recommendations: sheet.recommendations.map((r) => {
      const anchor = firstAnswer(r.dimension) ?? sheet.answers[0];
      return {
        library_key: r.library_key,
        weakness: r.base.weakness,
        action: r.base.action,
        steps: r.base.steps,
        expected_evidence: r.base.evidence,
        source_ids: [anchor.id, `R-${sheet.criterion.id}-${r.dimension === "commercial" ? "COM" : "SOC"}`],
      };
    }),
  };
}
