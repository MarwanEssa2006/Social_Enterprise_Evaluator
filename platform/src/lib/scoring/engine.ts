// Scoring Engine — sole authority for scores (D-11, D-22..D-37). Pure and deterministic: no I/O, no AI.
import { CRITERION_IDS, questionsFor } from "../questions/criteria";
import { codeOf, isKnown } from "../questions/codes";
import type { CriterionId } from "../questions/types";
import { readDimension } from "./readings";
import { dimensionConfidence, lowerMedian, minConf, rank } from "./confidence";
import {
  COMMERCIAL_GATEKEEPERS,
  CURRENT_METHODOLOGY,
  READING_SCORE,
  SERVICE_USER_NA,
  SOCIAL_GATEKEEPERS,
  type Methodology,
} from "./methodology";
import type {
  AssessmentInput,
  AssessmentResult,
  ClassificationKey,
  Confidence,
  CriterionResult,
  DimensionOverall,
  DimensionResult,
  Level,
  Reading,
} from "./types";

const NOT_SCORED_REASON: Partial<Record<Reading, string>> = {
  Undetermined: "unknown",
  NotYetDetermined: "not_yet_determined",
  Conflicting: "unresolved_conflict",
};

/** Codes that show beneficiaries do work / earn / participate (framework §4.0.2 model conflict check). */
const PARTICIPATION_CODES = new Set(["S+", "S", "L", "W"]);

function dimensionResult(crit: CriterionId, dim: "commercial" | "social", input: AssessmentInput, m: Methodology): DimensionResult {
  const qs = questionsFor(crit).filter((q) => q.dimension === dim);
  const codes = qs.map((q) => codeOf(q.id, input.answers[q.id]));
  const known = codes.filter(isKnown).length;

  if (dim === "social" && input.context.beneficiaryModel === "service_users" && (SERVICE_USER_NA as readonly string[]).includes(crit)) {
    const conflict = codes.some((cd) => cd !== undefined && PARTICIPATION_CODES.has(cd));
    if (!conflict) {
      return {
        dimension: dim,
        reading: "NotApplicable",
        score: null,
        status: "not_applicable",
        reason: "service_user_model",
        confidence: "NotApplicable",
        flags: [],
        known: 0,
        total: 0,
      };
    }
    const r = readDimension(crit, dim, input.answers, input.context, input.evidence, m);
    return finish(crit, dim, { reading: r.reading, flags: [...r.flags, "model_conflict"] }, input, known, qs.length);
  }
  const r = readDimension(crit, dim, input.answers, input.context, input.evidence, m);
  return finish(crit, dim, r, input, known, qs.length);
}

function finish(
  crit: CriterionId,
  dim: "commercial" | "social",
  r: { reading: Reading; flags: DimensionResult["flags"] },
  input: AssessmentInput,
  known: number,
  total: number,
): DimensionResult {
  const score = READING_SCORE[r.reading] ?? null;
  const scored = score !== null;
  return {
    dimension: dim,
    reading: r.reading,
    score,
    status: scored ? "scored" : "not_scored",
    reason: scored ? undefined : NOT_SCORED_REASON[r.reading],
    confidence: scored ? dimensionConfidence(crit, dim, input.answers, input.evidence, r.flags) : "NotAssessable",
    flags: r.flags,
    known,
    total,
  };
}

function criterionConfidence(a: DimensionResult, b: DimensionResult): Confidence {
  const scored = [a, b].filter((d) => d.status === "scored").map((d) => d.confidence);
  if (scored.length === 0) return "NotAssessable";
  return scored.reduce((x, y) => minConf(x, y));
}

/** Framework §4.5 outcome label (qualitative; presentation only). */
function outcomeOf(com: DimensionResult, soc: DimensionResult, conf: Confidence): string {
  const pos = (d: DimensionResult) => d.reading === "Strong" || d.reading === "Adequate";
  const neg = (d: DimensionResult) => d.reading === "Limited" || d.reading === "Weak" || d.reading === "Absent";
  if (soc.status === "not_applicable") {
    if (com.status === "not_scored") return com.reading === "Conflicting" ? "significant_uncertainty" : "insufficient_information";
    if (pos(com)) return rank(conf) >= rank("Moderate") ? (com.reading === "Strong" ? "strong" : "positive_partially_validated") : "potential_requiring_validation";
    return "weak";
  }
  if (com.reading === "Undetermined" || soc.reading === "Undetermined") return "insufficient_information";
  if (com.reading === "Conflicting" || soc.reading === "Conflicting") return "significant_uncertainty";
  if (com.reading === "NotYetDetermined" || soc.reading === "NotYetDetermined") {
    return pos(com) || pos(soc) ? "potential_requiring_validation" : "insufficient_information";
  }
  if ((pos(com) && neg(soc)) || (neg(com) && pos(soc))) return pos(com) ? "imbalanced_social" : "imbalanced_commercial";
  if (neg(com) && neg(soc)) return "weak";
  if (conf === "StatementOnly") return "potential_requiring_validation";
  if (conf === "Low") return "positive_partially_validated";
  return com.reading === "Strong" || soc.reading === "Strong" ? "strong" : "positive_partially_validated";
}

function roundHalfUp1(x: number): string {
  return (Math.round(x * 10 + 1e-9) / 10).toFixed(1);
}

function overall(
  dims: DimensionResult[],
  ids: CriterionId[],
  gatekeepers: readonly string[],
  minimumRequired: number,
  isCommercial: boolean,
  grantDependent: boolean,
  m: Methodology,
): DimensionOverall {
  const applicable = dims.filter((d) => d.status !== "not_applicable").length;
  const scoredDims = dims.filter((d) => d.status === "scored");
  const scores = scoredDims.map((d) => d.score!);
  const distribution: DimensionOverall["distribution"] = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0, notScored: 0, na: 0 };
  for (const d of dims) {
    if (d.status === "scored") distribution[String(d.score) as "5"]++;
    else if (d.status === "not_scored") distribution.notScored++;
    else distribution.na++;
  }
  const shown = scoredDims.length >= minimumRequired;
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const gk = gatekeepers.map((g) => dims[ids.indexOf(g as CriterionId)]);

  let level: Level;
  let levelReason: string;
  if (!shown) {
    level = "NotClassifiable";
    levelReason = "coverage_below_minimum";
  } else if (gk.some((d) => d.status !== "scored")) {
    level = "NotClassifiable";
    levelReason = "gatekeeper_not_scored";
  } else if (mean! < m.lowMean) {
    level = "Low";
    levelReason = "mean_below_3";
  } else if (gk.some((d) => d.score! <= 2)) {
    level = "Low";
    levelReason = "gatekeeper_weak";
  } else if (mean! >= m.highMean && !scores.some((s) => s <= 2) && !(isCommercial && grantDependent)) {
    level = "High";
    levelReason = "high";
  } else {
    level = "Moderate";
    levelReason = scores.some((s) => s <= 2) ? "weak_criterion_present" : isCommercial && grantDependent && mean! >= m.highMean ? "grant_dependent" : "moderate";
  }
  return {
    shown,
    mean: shown ? mean : null,
    display: shown && mean !== null ? roundHalfUp1(mean) : null,
    scored: scoredDims.length,
    applicable,
    minimumRequired,
    criteriaMet: scores.filter((s) => s >= 4).length,
    distribution,
    level,
    levelReason,
  };
}

function classify(c: Level, s: Level): ClassificationKey {
  if (c === "NotClassifiable" || s === "NotClassifiable") return "not_classified";
  if (c === "High" && s === "High") return "balanced_strong";
  if (c !== "Low" && s !== "Low") return "balanced_developing";
  if (c !== "Low" && s === "Low") return "social_gap";
  if (c === "Low" && s !== "Low") return "commercial_gap";
  return "weak_both";
}

export function evaluateCriteria(input: AssessmentInput, m: Methodology = CURRENT_METHODOLOGY): CriterionResult[] {
  return CRITERION_IDS.map((id) => {
    const com = dimensionResult(id, "commercial", input, m);
    const soc = dimensionResult(id, "social", input, m);
    const conf = criterionConfidence(com, soc);
    return { id, commercial: com, social: soc, confidence: conf, outcome: outcomeOf(com, soc, conf) };
  });
}

export function runAssessment(input: AssessmentInput, m: Methodology = CURRENT_METHODOLOGY): AssessmentResult {
  return aggregate(evaluateCriteria(input, m), input, m);
}

/** Spec §3–6: overall scores, levels, classification, confidence roll-up, completeness, coverage. */
export function aggregate(criteria: CriterionResult[], input: AssessmentInput, m: Methodology = CURRENT_METHODOLOGY): AssessmentResult {
  const ids = [...CRITERION_IDS];
  // Grant-dependent flag (framework §5.3, TD-24): grants cover costs and the commercial margin position is weak or contradictory.
  const c2 = criteria[1].commercial;
  const grantDependent =
    input.context.grantsCoverCosts &&
    (c2.status !== "scored" || (c2.score ?? 5) <= 3 || c2.flags.includes("adverse_anchor_inconsistency"));
  if (grantDependent && !c2.flags.includes("grant_dependent")) c2.flags.push("grant_dependent");

  const comDims = criteria.map((c) => c.commercial);
  const socDims = criteria.map((c) => c.social);
  const socApplicable = socDims.filter((d) => d.status !== "not_applicable").length;
  const socMin = Math.max(m.socialMinimumAbsolute, Math.ceil(m.socialMinimumShare * socApplicable - 1e-9));
  const commercial = overall(comDims, ids, COMMERCIAL_GATEKEEPERS, m.commercialMinimum, true, grantDependent, m);
  const social = overall(socDims, ids, SOCIAL_GATEKEEPERS, socMin, false, false, m);

  // Confidence roll-up (spec §5.3)
  const scoredConf = [...comDims, ...socDims].filter((d) => d.status === "scored").map((d) => d.confidence);
  const gkConf = [c2, criteria[0].social, criteria[6].social].filter((d) => d.status === "scored").map((d) => d.confidence);
  const capConf = (base: Confidence | null): Confidence => {
    if (base === null) return "NotAssessable";
    return gkConf.length ? gkConf.reduce((a, b) => minConf(a, b), base) : base;
  };
  const overallConf = capConf(lowerMedian(scoredConf));
  const comConf = lowerMedian(comDims.filter((d) => d.status === "scored").map((d) => d.confidence)) ?? "NotAssessable";
  const socConf = lowerMedian(socDims.filter((d) => d.status === "scored").map((d) => d.confidence)) ?? "NotAssessable";
  const distribution = { High: 0, Moderate: 0, Low: 0, StatementOnly: 0 };
  for (const cf of scoredConf) if (cf in distribution) distribution[cf as keyof typeof distribution]++;

  // Project flags and classification qualifiers (spec §3.5)
  const projectFlags: string[] = [];
  if (grantDependent) projectFlags.push("grant_dependent");
  if (socApplicable < 8) projectFlags.push("limited_social_coverage");
  const modelConflicts = criteria.filter((c) => c.social.flags.includes("model_conflict")).map((c) => c.id);
  if (modelConflicts.length) projectFlags.push("model_conflict");
  const gkSocialWeak = [criteria[0].social, criteria[6].social].some(
    (d) => d.status !== "scored" || (d.score ?? 0) <= 2,
  );
  if (input.context.beneficiaryModel === "service_users" && gkSocialWeak) projectFlags.push("social_impact_not_demonstrated");
  const unresolved = [...comDims, ...socDims].filter((d) => d.reading === "Conflicting").length;
  if (unresolved) projectFlags.push(`unresolved_conflicts:${unresolved}`);
  const notScored = [...comDims, ...socDims].filter((d) => d.status === "not_scored").length;
  if (notScored) projectFlags.push(`not_scored:${notScored}`);
  if (input.context.beneficiaryModel === "service_users") projectFlags.push("service_benefit_gap");

  const key = classify(commercial.level, social.level);
  const qualifiers = [`confidence:${overallConf}`];
  if (overallConf === "Low" || overallConf === "StatementOnly") qualifiers.push("mainly_founder_statements");
  for (const f of projectFlags) qualifiers.push(f);
  qualifiers.push(`methodology:${m.version}`);

  const sum = (dims: typeof comDims) =>
    dims.reduce((a, d) => ({ known: a.known + d.known, total: a.total + d.total }), { known: 0, total: 0 });
  const ctxComplete = [input.context.country, input.context.area].filter((v) => v && v.trim()).length +
    (input.context.beneficiaryModel !== "undetermined" ? 1 : 0);

  return {
    methodologyVersion: m.version,
    criteria,
    commercial,
    social,
    classification: { key, qualifiers },
    confidence: { overall: overallConf, commercial: comConf, social: socConf, distribution },
    completeness: {
      commercial: sum(comDims),
      social: sum(socDims),
      evidenceBasisStated: codeOf("C1-EF", input.answers["C1-EF"]) !== undefined && codeOf("C1-EF", input.answers["C1-EF"]) !== "U",
      context: { complete: ctxComplete, total: 3 },
    },
    projectFlags,
  };
}
