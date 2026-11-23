import { CRITERION_IDS } from "@/lib/questions/criteria";
import type { AssessmentInput, Confidence, CriterionResult, DimensionResult, ProjectContext } from "@/lib/scoring/types";

export type Cell = number | "NS" | "NA" | "CF";

const READ: Record<number, DimensionResult["reading"]> = { 5: "Strong", 4: "Adequate", 3: "Limited", 2: "Weak", 1: "Absent" };

function dim(dimension: "commercial" | "social", v: Cell, conf: Confidence): DimensionResult {
  if (v === "NA") return { dimension, reading: "NotApplicable", score: null, status: "not_applicable", confidence: "NotApplicable", flags: [], known: 0, total: 0 };
  if (v === "NS" || v === "CF")
    return { dimension, reading: v === "CF" ? "Conflicting" : "Undetermined", score: null, status: "not_scored", confidence: "NotAssessable", flags: [], known: 0, total: 2 };
  return { dimension, reading: READ[v], score: v, status: "scored", confidence: conf, flags: [], known: 2, total: 2 };
}

/** Build criterion results directly from scores, for testing the aggregation rules (spec §3–6). */
export function crit(com: Cell[], soc: Cell[], conf: Confidence = "Moderate"): CriterionResult[] {
  return CRITERION_IDS.map((id, i) => ({
    id,
    commercial: dim("commercial", com[i], conf),
    social: dim("social", soc[i], conf),
    confidence: conf,
    outcome: "",
  }));
}

export function ctx(p: Partial<ProjectContext> = {}): ProjectContext {
  return { country: "Egypt", area: "Assiut", beneficiaryModel: "workers", grantsCoverCosts: false, ...p };
}

export function input(answers: Record<string, number> = {}, p: Partial<ProjectContext> = {}): AssessmentInput {
  return { context: ctx(p), answers, evidence: [] };
}

/** A complete answer set where every question takes the first option (generally the strongest). */
export function allFirst(): Record<string, number> {
  const a: Record<string, number> = {};
  for (let c = 1; c <= 8; c++) for (let q = 1; q <= 4; q++) a[`C${c}-Q${q}`] = 0;
  a["C1-EF"] = 3; // interviews/surveys
  a["C1-Q1"] = 0; // individuals
  a["C1-Q2"] = 4; // > 10,000
  a["C1-Q3"] = 2; // women
  a["C1-Q4"] = 4; // > 10,000
  return a;
}
