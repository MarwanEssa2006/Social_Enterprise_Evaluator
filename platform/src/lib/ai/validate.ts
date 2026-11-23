// Output Validation (Phase 4, component 6). Rejects anything not grounded in the fact sheet.
import { CriterionAnalysisSchema, type CriterionAnalysis } from "./schema";
import { factIds, type FactSheet } from "./factsheet";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function normaliseDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** Numbers as written, normalised (thousands separators removed). */
export function extractNumbers(s: string): string[] {
  const t = normaliseDigits(s);
  const m = t.match(/\d+(?:[,،]\d{3})*(?:\.\d+)?/g) ?? [];
  return m.map((x) => x.replace(/[,،]/g, "").replace(/^0+(?=\d)/, ""));
}

const SCORE_PATTERNS = [
  /\b[0-5](?:[.,]\d)?\s*(?:\/|out of)\s*5\b/i,
  /[0-5٠-٥](?:[.,]\d)?\s*(?:من|\/)\s*[5٥]/,
];
const SCORE_WORDS = /(^|[^\p{L}])(score|scores|scored|scoring|rating|درجة|الدرجة|درجات|نقاط|نقطة)([^\p{L}]|$)/iu;
const ALLOWED_SCORE_PHRASES = /not scored|غير مُقيَّم|غير مقيم|غير مُقيّم/gi;
// "Documented" (موثق) is allowed: the framework distinguishes documented evidence from verified facts.
const VERIFIED_WORDS = /(^|[^\p{L}])(verified|proven|confirmed|ثابت|مؤكد|مؤكَّد|تم التحقق|مُثبت|مثبت)([^\p{L}]|$)/iu;
const NEGATED_VERIFIED = /(غير|ليس|ليست|لم يتم|not|un)\s*-?\s*(verified|proven|confirmed|ثابت|مؤكد|مؤكَّد|التحقق|مُثبت|مثبت)/giu;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  analysis?: CriterionAnalysis;
  missingKeys: string[];
}

export function validateAnalysis(raw: string, sheet: FactSheet): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ["Response is not valid JSON."], missingKeys: [] };
  }
  const res = CriterionAnalysisSchema.safeParse(parsed);
  if (!res.success) {
    return { ok: false, errors: res.error.issues.slice(0, 6).map((i) => `Schema: ${i.path.join(".")} ${i.message}`), missingKeys: [] };
  }
  const a = res.data;
  const errors: string[] = [];
  if (a.criterion !== sheet.criterion.id) errors.push(`criterion must be ${sheet.criterion.id}`);

  const ids = factIds(sheet);
  const strongEvidence = new Set(sheet.evidence.filter((e) => e.evidence_class === "EV-1" || e.evidence_class === "EV-2").map((e) => e.id));
  const allowedNumbers = new Set(extractNumbers(JSON.stringify(sheet)));

  const checkText = (where: string, text: string, sources?: string[]) => {
    for (const n of extractNumbers(text)) {
      if (!allowedNumbers.has(n)) errors.push(`${where}: number "${n}" does not appear in FACT_SHEET`);
    }
    if (SCORE_PATTERNS.some((p) => p.test(text))) errors.push(`${where}: contains a score-like expression`);
    if (SCORE_WORDS.test(text.replace(ALLOWED_SCORE_PHRASES, ""))) errors.push(`${where}: mentions scores; results must be described in words only`);
    if (VERIFIED_WORDS.test(text.replace(NEGATED_VERIFIED, "")) && !(sources ?? []).some((s) => strongEvidence.has(s))) {
      errors.push(`${where}: describes information as verified without EV-1/EV-2 evidence`);
    }
  };
  const checkSources = (where: string, sources: string[]) => {
    for (const s of sources) if (!ids.has(s)) errors.push(`${where}: unknown source id "${s}"`);
  };

  checkText("summary", a.summary);
  checkText("commercial_explanation", a.commercial_explanation);
  checkText("social_explanation", a.social_explanation);
  for (const [field, list] of [["strengths", a.strengths], ["weaknesses", a.weaknesses], ["unsupported_assumptions", a.unsupported_assumptions], ["information_gaps", a.information_gaps]] as const) {
    list.forEach((c, i) => {
      checkSources(`${field}[${i}]`, c.source_ids);
      checkText(`${field}[${i}]`, c.text, c.source_ids);
    });
  }
  const selected = new Set(sheet.recommendations.map((r) => r.library_key));
  const seen = new Set<string>();
  a.recommendations.forEach((r, i) => {
    if (!selected.has(r.library_key)) errors.push(`recommendations[${i}]: library_key "${r.library_key}" was not selected`);
    if (seen.has(r.library_key)) errors.push(`recommendations[${i}]: duplicate library_key`);
    seen.add(r.library_key);
    checkSources(`recommendations[${i}]`, r.source_ids);
    if (!r.source_ids.some((s) => s.startsWith("A-") || s.startsWith("E-") || s === "P-CONTEXT")) {
      errors.push(`recommendations[${i}]: must cite at least one project-specific fact (A-, E-, or P-CONTEXT); generic advice is not accepted`);
    }
    for (const t of [r.weakness, r.action, ...r.steps, ...r.expected_evidence]) checkText(`recommendations[${i}]`, t, r.source_ids);
  });
  const missingKeys = [...selected].filter((k) => !seen.has(k));
  return { ok: errors.length === 0, errors: errors.slice(0, 12), analysis: errors.length ? undefined : a, missingKeys };
}
