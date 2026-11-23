// Input Processing (Phase 4, component 1): builds a grounded, ID-tagged fact sheet per criterion.
// Data minimisation (TD-15): no user names, emails, project name, or uploaded file contents.
import { codeOf } from "../questions/codes";
import { criterionMeta, questionsFor } from "../questions/criteria";
import type { Answers } from "../questions/types";
import { evidenceKind, type EvidenceItemInput } from "../evidence/kinds";
import type { CriterionResult, ProjectContext } from "../scoring/types";
import type { SelectedRecommendation } from "../recommendations/select";
import { FLAG_TEXT } from "./flags";

export type Lang = "ar" | "en";

const MEANING: Record<string, string> = {
  "S+": "strong indication", S: "positive indication", L: "limited indication", W: "weak or adverse indication",
  X: "founder states this does not exist yet", ND: "not yet determined by the founder", U: "unknown to the founder (not a negative signal)",
  C: "descriptive category", B1: "size band 1 of 5", B2: "size band 2 of 5", B3: "size band 3 of 5", B4: "size band 4 of 5", B5: "size band 5 of 5",
};

export interface FactSheet {
  language: Lang;
  criterion: { id: string; name: string };
  context: { id: "P-CONTEXT"; country: string; area: string; beneficiary_model: string; grants_cover_part_of_costs: boolean };
  answers: { id: string; dimension: string; question: string; answer: string; meaning: string; status: "founder_statement" }[];
  evidence: { id: string; dimension: string; kind: string; evidence_class: string; title: string; description: string; numeric_value: number | null }[];
  results: { id: string; dimension: string; result: string; status: string; reason: string | null; evidence_confidence: string; flags: { flag: string; meaning: string }[] }[];
  recommendations: { library_key: string; dimension: string; priority: string; type: string; base: { title: string; weakness: string; why: string; action: string; steps: string[]; evidence: string[] } }[];
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

export function buildFactSheet(
  crit: CriterionResult,
  answers: Answers,
  context: ProjectContext,
  evidence: EvidenceItemInput[],
  recs: SelectedRecommendation[],
  lang: Lang,
): { sheet: FactSheet; evidenceIdMap: Record<string, string> } {
  const meta = criterionMeta(crit.id);
  const evidenceIdMap: Record<string, string> = {};
  const ev = evidence
    .filter((e) => e.criterion === crit.id)
    .map((e, i) => {
      const id = `E-${crit.id}-${i + 1}`;
      evidenceIdMap[id] = e.id;
      const k = evidenceKind(e.kind);
      return {
        id, dimension: e.dimension, kind: k?.en ?? e.kind, evidence_class: k?.cls ?? "unknown",
        title: clip(e.title, 120), description: clip(e.description, 400), numeric_value: e.numericValue ?? null,
      };
    });
  const sheet: FactSheet = {
    language: lang,
    criterion: { id: crit.id, name: lang === "ar" ? meta.nameAr : meta.nameEn },
    context: {
      id: "P-CONTEXT", country: context.country, area: context.area,
      beneficiary_model: context.beneficiaryModel, grants_cover_part_of_costs: context.grantsCoverCosts,
    },
    answers: questionsFor(crit.id).map((q) => {
      const idx = answers[q.id];
      const code = codeOf(q.id, idx);
      return {
        id: `A-${q.id}`, dimension: q.dimension, question: q.text,
        answer: idx === undefined ? "(unanswered)" : q.options[idx]?.text ?? "(unanswered)",
        meaning: code ? MEANING[code] : "unanswered", status: "founder_statement" as const,
      };
    }),
    evidence: ev,
    results: (["commercial", "social"] as const).map((dim) => {
      const d = crit[dim];
      return {
        id: `R-${crit.id}-${dim === "commercial" ? "COM" : "SOC"}`, dimension: dim, result: d.reading, status: d.status,
        reason: d.reason ?? null, evidence_confidence: d.confidence,
        flags: d.flags.map((f) => ({ flag: f, meaning: FLAG_TEXT[f]?.[lang] ?? f })),
      };
    }),
    recommendations: recs.map((r) => ({
      library_key: r.key, dimension: r.dimension, priority: r.priority, type: r.type,
      base: { title: r.base[lang].title, weakness: r.base[lang].weakness, why: r.base[lang].why, action: r.base[lang].action, steps: r.base[lang].steps, evidence: r.base[lang].evidence },
    })),
  };
  return { sheet, evidenceIdMap };
}

/** All IDs the model may cite. */
export function factIds(sheet: FactSheet): Set<string> {
  return new Set([
    sheet.context.id,
    ...sheet.answers.map((a) => a.id),
    ...sheet.evidence.map((e) => e.id),
    ...sheet.results.map((r) => r.id),
  ]);
}
