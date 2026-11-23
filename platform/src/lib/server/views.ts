import "server-only";
import type { AssessmentRow, RecommendationRow } from "./repo";
import type { AssessmentInput, AssessmentResult } from "../scoring/types";
import type { CriterionAnalysis } from "../ai/schema";
import type { CriterionStatus, FinalRecommendation } from "../ai/pipeline";

export interface AssessmentView {
  row: AssessmentRow;
  input: AssessmentInput;
  result: AssessmentResult;
  analysis: { lang: "ar" | "en"; criteria: Record<string, CriterionAnalysis & { status: CriterionStatus }> };
  aiMeta: { provider: string; model: string; promptVersion: string; modeReason?: string; perCriterion: Record<string, { status: CriterionStatus }> };
}

export function viewAssessment(row: AssessmentRow): AssessmentView {
  return {
    row,
    input: JSON.parse(row.input_snapshot),
    result: JSON.parse(row.results),
    analysis: JSON.parse(row.analysis),
    aiMeta: JSON.parse(row.ai_meta),
  };
}

export function recContent(r: RecommendationRow): FinalRecommendation {
  return JSON.parse(r.content);
}

/** Recommendation text in the requested language: AI-personalised wording when it exists in that language. */
export function recText(rec: FinalRecommendation, lang: "ar" | "en") {
  const base = rec.base[lang];
  const p = rec.personalised && rec.personalised.lang === lang ? rec.personalised : null;
  return {
    title: base.title,
    weakness: p?.weakness ?? base.weakness,
    why: base.why,
    action: p?.action ?? base.action,
    steps: p?.steps ?? base.steps,
    evidence: p?.expected_evidence ?? base.evidence,
  };
}

export function fmtDate(iso: string, locale: "ar" | "en") {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
