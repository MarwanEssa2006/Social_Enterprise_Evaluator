// Deterministic recommendation selection and priority (Phase 4 workflow step 1–2: evaluation logic identifies
// the gap; the library selects interventions). AI never adds, removes, or re-prioritises recommendations.
import { criterionMeta } from "../questions/criteria";
import { codeOf } from "../questions/codes";
import { questionsFor } from "../questions/criteria";
import type { Answers } from "../questions/types";
import type { CriterionResult, DimensionResult, FlagKey } from "../scoring/types";
import { COMMERCIAL_GATEKEEPERS, SOCIAL_GATEKEEPERS } from "../scoring/methodology";
import { LIBRARY, conflictTemplate, infoTemplate, type RecText, type RecType } from "./library";

export type Priority = "high" | "medium" | "low";

export interface SelectedRecommendation {
  key: string;
  criterion: string;
  dimension: "commercial" | "social";
  type: RecType;
  priority: Priority;
  relatedQuestions: string[];
  relatedFlags: FlagKey[];
  base: { ar: RecText; en: RecText };
}

function isGatekeeper(crit: string, dim: "commercial" | "social") {
  return dim === "commercial"
    ? (COMMERCIAL_GATEKEEPERS as readonly string[]).includes(crit)
    : (SOCIAL_GATEKEEPERS as readonly string[]).includes(crit);
}

function priorityOf(crit: string, d: DimensionResult, type: RecType): Priority {
  const gk = isGatekeeper(crit, d.dimension);
  const weakOrUnscored = d.status === "not_scored" || (d.score !== null && d.score <= 2);
  if (gk && weakOrUnscored) return "high";
  if (weakOrUnscored) return "medium";
  if (type === "performance" && d.score === 3) return "medium";
  if (type === "evidence" && gk && d.confidence === "StatementOnly") return "medium";
  return "low";
}

export function selectRecommendations(criteria: CriterionResult[], answers: Answers): SelectedRecommendation[] {
  const out: SelectedRecommendation[] = [];
  for (const c of criteria) {
    const meta = criterionMeta(c.id);
    for (const dim of ["commercial", "social"] as const) {
      const d = c[dim];
      if (d.status === "not_applicable") continue;
      const qs = questionsFor(c.id).filter((q) => q.dimension === dim).map((q) => q.id);
      if (d.reading === "Conflicting") {
        out.push({
          key: `${c.id}-${dim === "commercial" ? "COM" : "SOC"}-CONFLICT`, criterion: c.id, dimension: dim, type: "information",
          priority: priorityOf(c.id, d, "information"), relatedQuestions: qs, relatedFlags: d.flags, base: conflictTemplate(meta.nameEn, meta.nameAr),
        });
      }
      const unknownQs = qs.filter((q) => {
        const code = codeOf(q, answers[q]);
        return code === "U" || code === "ND";
      });
      if (d.reading === "Undetermined" || d.reading === "NotYetDetermined" || unknownQs.length > 0) {
        out.push({
          key: `${c.id}-${dim === "commercial" ? "COM" : "SOC"}-INFO`, criterion: c.id, dimension: dim, type: "information",
          priority: priorityOf(c.id, d, "information"), relatedQuestions: unknownQs.length ? unknownQs : qs, relatedFlags: [], base: infoTemplate(meta.nameEn, meta.nameAr),
        });
      }
      for (const e of LIBRARY) {
        if (e.criterion !== c.id || e.dimension !== dim) continue;
        if (!e.when(d, answers)) continue;
        out.push({
          key: e.key, criterion: c.id, dimension: dim, type: e.type, priority: priorityOf(c.id, d, e.type),
          relatedQuestions: e.relatedQuestions, relatedFlags: (e.relatedFlags ?? []).filter((f) => d.flags.includes(f)), base: { ar: e.ar, en: e.en },
        });
      }
    }
  }
  const rank = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.priority] - rank[b.priority] || a.criterion.localeCompare(b.criterion));
}
