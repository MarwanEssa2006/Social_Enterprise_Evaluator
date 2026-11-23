// Version comparison — SCORING_SPECIFICATION.md §8 (D-32, OPEN-37 approved via D-37).
// Changes are explained at criterion level with their cause; methodology changes are never shown as progress.
import { runAssessment } from "./engine";
import { methodologyByVersion } from "./methodology";
import type { AssessmentInput, AssessmentResult } from "./types";

export type ChangeCause = "project_change" | "methodology_change" | "both";

export interface CriterionChange {
  criterion: string;
  dimension: "commercial" | "social";
  from: number | null;
  to: number | null;
  fromStatus: string;
  toStatus: string;
  cause: ChangeCause;
}

export interface Comparison {
  fromVersion: number;
  toVersion: number;
  methodologyChanged: boolean;
  changes: CriterionChange[];
  commercial: { from: string | null; to: string | null };
  social: { from: string | null; to: string | null };
  classification: { from: string; to: string };
}

const cell = (r: AssessmentResult, crit: string, dim: "commercial" | "social") => {
  const d = r.criteria.find((c) => c.id === crit)![dim];
  return { score: d.score, status: d.status };
};

export function compareAssessments(
  a: { version: number; input: AssessmentInput; result: AssessmentResult },
  b: { version: number; input: AssessmentInput; result: AssessmentResult },
): Comparison {
  const methodologyChanged = a.result.methodologyVersion !== b.result.methodologyVersion;
  // Re-score the earlier inputs under the later methodology, for comparison only (never saved).
  const aUnderB = methodologyChanged ? runAssessment(a.input, methodologyByVersion(b.result.methodologyVersion)) : a.result;
  const changes: CriterionChange[] = [];
  for (const c of a.result.criteria) {
    for (const dim of ["commercial", "social"] as const) {
      const from = cell(a.result, c.id, dim);
      const to = cell(b.result, c.id, dim);
      if (from.score === to.score && from.status === to.status) continue;
      const mid = cell(aUnderB, c.id, dim);
      const methodPart = mid.score !== from.score || mid.status !== from.status;
      const projectPart = mid.score !== to.score || mid.status !== to.status;
      changes.push({
        criterion: c.id,
        dimension: dim,
        from: from.score,
        to: to.score,
        fromStatus: from.status,
        toStatus: to.status,
        cause: methodPart && projectPart ? "both" : methodPart ? "methodology_change" : "project_change",
      });
    }
  }
  return {
    fromVersion: a.version,
    toVersion: b.version,
    methodologyChanged,
    changes,
    commercial: { from: a.result.commercial.display, to: b.result.commercial.display },
    social: { from: a.result.social.display, to: b.result.social.display },
    classification: { from: a.result.classification.key, to: b.result.classification.key },
  };
}
