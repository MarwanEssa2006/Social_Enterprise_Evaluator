// Dimension readings — deterministic implementation of EVALUATION_FRAMEWORK.md §6.4–13.4 (approved, D-33)
// with SCORING_SPECIFICATION.md §2.3–2.5 (approved, D-37): conflict vs flag cases, adverse-anchor rule (OPEN-39),
// C2/C3 overlap rule (ISSUE-11), and Large Market calibration (§7).
import { codeOf, type AnswerCode } from "../questions/codes";
import type { Answers } from "../questions/types";
import type { EvidenceItemInput } from "../evidence/kinds";
import type { FlagKey, ProjectContext, Reading } from "./types";
import type { Methodology } from "./methodology";

export interface ReadingOutcome {
  reading: Reading;
  flags: FlagKey[];
}

const LEVEL: Partial<Record<AnswerCode, number>> = { "S+": 5, S: 4, L: 3, W: 2, X: 1 };
const LEVEL_READING: Record<number, Reading> = { 5: "Strong", 4: "Adequate", 3: "Limited", 2: "Weak", 1: "Absent" };
const READING_LEVEL: Partial<Record<Reading, number>> = { Strong: 5, Adequate: 4, Limited: 3, Weak: 2, Absent: 1 };

const isFav = (c?: AnswerCode) => c === "S+" || c === "S";
const out = (reading: Reading, ...flags: FlagKey[]): ReadingOutcome => ({ reading, flags });

/** Cap a reading at a maximum level (e.g., "Adequate at most"). Non-scored readings pass through. */
function cap(r: ReadingOutcome, max: Reading, flag?: FlagKey): ReadingOutcome {
  const l = READING_LEVEL[r.reading];
  const m = READING_LEVEL[max]!;
  const flags = flag ? [...r.flags, flag] : r.flags;
  if (l === undefined) return { reading: r.reading, flags };
  return { reading: LEVEL_READING[Math.min(l, m)], flags };
}

/**
 * Generic anchor/qualifier combination (framework §4.2: answers are interpreted together, never summed).
 * - Anchor U → Undetermined; ND → Not yet determined.
 * - Adverse anchor (W/X) with favourable qualifier → scored on the anchor + flag (adverse-anchor rule, OPEN-39).
 * - Positive anchor: the lower of anchor and qualifier, where a W/X qualifier lowers to Limited at most (floor).
 * - Qualifier U/ND → anchor alone, flagged provisional; qualifier C → anchor alone.
 */
function combine(anchor: AnswerCode | undefined, qual: AnswerCode | undefined, floor = 3): ReadingOutcome {
  if (anchor === undefined || anchor === "U") return out("Undetermined");
  if (anchor === "ND") return out("NotYetDetermined");
  if (anchor === "X") return isFav(qual) ? out("Absent", "adverse_anchor_inconsistency") : out("Absent");
  if (anchor === "W") return isFav(qual) ? out("Weak", "adverse_anchor_inconsistency") : out("Weak");
  const a = LEVEL[anchor];
  if (a === undefined) return out("Undetermined");
  if (qual === undefined || qual === "U" || qual === "ND") return out(LEVEL_READING[a], "provisional_qualifier_unknown");
  const q = LEVEL[qual];
  if (q === undefined) return out(LEVEL_READING[a]);
  return out(LEVEL_READING[Math.min(a, Math.max(q, floor))]);
}

interface Ctx {
  answers: Answers;
  context: ProjectContext;
  evidence: EvidenceItemInput[];
  m: Methodology;
}

const c = (x: Ctx, qid: string) => codeOf(qid, x.answers[qid]);
const opt = (x: Ctx, qid: string) => x.answers[qid];
const hasEvidence = (x: Ctx, crit: string, kind: string) =>
  x.evidence.some((e) => e.criterion === crit && e.kind === kind);

function bandIndex(code?: AnswerCode): number | undefined {
  if (!code || code[0] !== "B") return undefined;
  return Number(code.slice(1)) - 1;
}
/** Lower bounds of the approved size bands (used only for the population plausibility check). */
const BAND_LOWER = [0, 100, 501, 2001, 10001];

function populationOf(x: Ctx): number | undefined {
  const p = x.evidence.find((e) => e.criterion === "C1" && e.kind === "population_statistic" && e.numericValue);
  return p?.numericValue ?? undefined;
}

// ---------- C1 Large Market ----------
function c1Commercial(x: Ctx): ReadingOutcome {
  const q1 = c(x, "C1-Q1");
  const q2 = c(x, "C1-Q2");
  const flags: FlagKey[] = [];
  if (!x.context.country || !x.context.area) flags.push("geography_missing");
  if (c(x, "C1-EF") === "U" && bandIndex(q2) !== undefined) flags.push("evidence_basis_unknown");
  const b = bandIndex(q2);
  if (b === undefined) return { reading: q2 === "ND" ? "NotYetDetermined" : "Undetermined", flags };
  if (q1 === "U" || q1 === undefined) {
    if (b >= 3) return { reading: "Conflicting", flags: [...flags, "payer_not_identified"] };
    flags.push("payer_not_identified");
  }
  const payer = opt(x, "C1-Q1");
  const organisations = payer === 1 || payer === 2 || payer === 3; // companies, NGOs, government
  const pop = populationOf(x);
  if (pop !== undefined && !organisations && BAND_LOWER[b] > pop) {
    return { reading: "Conflicting", flags: [...flags, "implausible_vs_population"] };
  }
  const table = organisations ? x.m.lmCommercialOrganisations : x.m.lmCommercialIndividuals;
  return { reading: table[b], flags };
}

function c1Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C1-Q3");
  const q4 = c(x, "C1-Q4");
  const flags: FlagKey[] = [];
  if (!x.context.country || !x.context.area) flags.push("geography_missing");
  if (opt(x, "C1-Q3") === 0) flags.push("guardian_consent");
  const b = bandIndex(q4);
  if (b === undefined) return { reading: "Undetermined", flags };
  if (q3 === "U" || q3 === undefined) return { reading: "Conflicting", flags: [...flags, "beneficiary_group_not_defined"] };
  if (q3 === "ND") flags.push("beneficiary_group_not_defined");
  const pop = populationOf(x);
  if (pop !== undefined && BAND_LOWER[b] > pop) return { reading: "Conflicting", flags: [...flags, "implausible_vs_population"] };
  return { reading: x.m.lmSocial[b], flags };
}

// ---------- C2 High Gross Margins ----------
function c2Commercial(x: Ctx): ReadingOutcome {
  const q1 = c(x, "C2-Q1");
  const q2 = c(x, "C2-Q2");
  if ((q1 === "U" || q1 === undefined) && isFav(q2)) return out("Conflicting", "inconsistency");
  let r = combine(q1, q2);
  if ((q1 === "S+" || q1 === "S") && q2 === "W") r = out("Limited", "overheads_or_volume");
  if (q1 === "L" && q2 === "S+") r = out("Limited", "inconsistency");
  return r;
}

function c2Social(x: Ctx): ReadingOutcome {
  const q3o = opt(x, "C2-Q3");
  const q3 = c(x, "C2-Q3");
  const q4 = c(x, "C2-Q4");
  const flags: FlagKey[] = [];
  if (opt(x, "C2-Q4") === 3) flags.push("delayed_beneficiary_income");
  // ISSUE-11: "intermittent" describes regularity (scored in C3) → adequacy read from Q4 alone.
  if (q3o === 2) {
    const r = combine(q4, undefined);
    return { reading: r.reading, flags };
  }
  if (q3 === "S+" && (q4 === "L" || q4 === "W")) {
    if (opt(x, "C2-Q4") === 3) return { reading: "Limited", flags: [...flags, "inconsistency"] };
    return { reading: "Adequate", flags: [...flags, "inconsistency"] };
  }
  const r = combine(q3, q4);
  return { reading: r.reading, flags: [...flags, ...r.flags] };
}

// ---------- C3 Recurring Revenue ----------
function c3Commercial(x: Ctx): ReadingOutcome {
  const o1 = opt(x, "C3-Q1");
  let q1 = c(x, "C3-Q1");
  const q2 = c(x, "C3-Q2");
  if (o1 === 3 && !isFav(q2)) q1 = "L"; // add-on purchases recur only if the need recurs
  if (q1 === "W" && isFav(q2)) return out("Limited", "untapped_recurring_need");
  if (o1 === 1 && q2 === "W") return out("Conflicting", "inconsistency"); // subscription vs no repeat need
  if (o1 === 0 && (opt(x, "C3-Q2") === 3 || q2 === "W")) return out("Conflicting", "inconsistency");
  return combine(q1, q2);
}

function c3Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C3-Q3");
  const q4 = c(x, "C3-Q4");
  if (q3 === "S+" && q4 === "W") return out("Conflicting", "inconsistency");
  return combine(q3, q4);
}

// ---------- C4 Leverage Our Capabilities ----------
function c4Commercial(x: Ctx): ReadingOutcome {
  const q1 = c(x, "C4-Q1");
  const o1 = opt(x, "C4-Q1");
  const q2 = c(x, "C4-Q2");
  if (q1 === "X" && isFav(q2)) return out("Conflicting", "inconsistency");
  const r = combine(q2, q1);
  if (q2 === "S+" && (o1 === 1 || o1 === 2 || o1 === 3)) return cap(r, "Adequate", "non_technical_team_only");
  return r;
}

function c4Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C4-Q3");
  const q4 = c(x, "C4-Q4");
  if (q3 === "W" && q4 === "S+") return out("Conflicting", "inconsistency");
  const r = combine(q4, q3);
  if (opt(x, "C4-Q3") === 4) return cap(r, "Adequate", "heterogeneous_skills");
  return r;
}

// ---------- C5 Supply Chain Capabilities ----------
function c5Commercial(x: Ctx): ReadingOutcome {
  const o1 = opt(x, "C5-Q1");
  const q1 = c(x, "C5-Q1");
  const q2 = c(x, "C5-Q2");
  if ((q1 === "U" || q1 === undefined) && isFav(q2)) return out("Conflicting", "inconsistency");
  if (q2 === "X") return out("Absent");
  const base = combine(q2, undefined);
  const flags: FlagKey[] = [];
  if (o1 === 2) flags.push("single_supplier");
  if (o1 === 4) flags.push("import_dependency");
  if (q1 === "L" || q1 === "W") return cap({ reading: base.reading, flags }, "Adequate");
  return { reading: base.reading, flags };
}

function c5Social(x: Ctx): ReadingOutcome {
  const o3 = opt(x, "C5-Q3");
  const q3 = c(x, "C5-Q3");
  const q4 = c(x, "C5-Q4");
  if (o3 === 4 && q4 === "S+") return out("Conflicting", "inconsistency");
  if (o3 === 3 && q4 === "S+") return out("Adequate", "inconsistency");
  return combine(q4, q3);
}

// ---------- C6 Direct Customer Access ----------
function c6Commercial(x: Ctx): ReadingOutcome {
  const o1 = opt(x, "C6-Q1");
  const q1 = c(x, "C6-Q1");
  const o2 = opt(x, "C6-Q2");
  const q2 = c(x, "C6-Q2");
  if (o1 === 0 && o2 === 2) return out("Conflicting", "inconsistency");
  if (q1 === "X" && isFav(q2)) return out("Conflicting", "inconsistency");
  if (q1 === "X" && q2 === "X") return out("Absent");
  if (o2 === 2) {
    return hasEvidence(x, "C6", "distributor_agreement") ? out("Adequate", "single_intermediary") : out("Limited", "single_intermediary");
  }
  return combine(q2, q1 === "X" ? "X" : q1);
}

function c6Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C6-Q3");
  const q4 = c(x, "C6-Q4");
  if (q3 === "L" && isFav(q4)) return out("Adequate");
  if (q3 === "S+" && q4 === "W") return out("Limited", "inconsistency");
  return combine(q3, q4);
}

// ---------- C7 PR & Communications ----------
function c7Commercial(x: Ctx): ReadingOutcome {
  const q1 = c(x, "C7-Q1");
  const o2 = opt(x, "C7-Q2");
  const q2 = c(x, "C7-Q2");
  if (q2 === "ND" && isFav(q1)) return cap(combine(q1, undefined), "Adequate", "appeal_untested");
  const r = combine(q1, q2);
  if (o2 === 2) return cap(r, "Adequate", "supporter_appeal_only");
  return r;
}

function c7Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C7-Q3");
  const q4 = c(x, "C7-Q4");
  const flags: FlagKey[] = [];
  if (opt(x, "C7-Q4") === 2) flags.push("impact_expected_not_visible");
  if (opt(x, "C1-Q3") === 0) flags.push("guardian_consent");
  const base = combine(q4, undefined);
  if (q3 === "L") return cap({ reading: base.reading, flags }, "Adequate", "consent_verification");
  if (q3 === "X") return cap({ reading: base.reading, flags }, "Adequate", "inconsistency");
  if (q3 === "U") return { reading: base.reading, flags: [...flags, "provisional_qualifier_unknown"] };
  return { reading: combine(q4, q3).reading, flags };
}

// ---------- C8 Exit Strategy ----------
function c8Commercial(x: Ctx): ReadingOutcome {
  const q1 = c(x, "C8-Q1");
  const o2 = opt(x, "C8-Q2");
  const q2 = c(x, "C8-Q2");
  const flags: FlagKey[] = o2 === 1 ? ["mission_preservation"] : [];
  if (q1 === "X" && q2 === "C") return { reading: "Limited", flags: [...flags, "plan_without_counterpart"] };
  if (q1 === "X" && q2 === "X") return { reading: "Absent", flags };
  if (isFav(q1) && q2 === "X") return { reading: "Adequate", flags };
  const r = combine(q1, q2);
  return { reading: r.reading, flags: [...flags, ...r.flags] };
}

function c8Social(x: Ctx): ReadingOutcome {
  const q3 = c(x, "C8-Q3");
  const q4 = c(x, "C8-Q4");
  if (q4 === "S+" && (q3 === "W" || q3 === "X")) return out("Conflicting", "inconsistency");
  return combine(q4, q3);
}

const READERS: Record<string, { commercial: (x: Ctx) => ReadingOutcome; social: (x: Ctx) => ReadingOutcome }> = {
  C1: { commercial: c1Commercial, social: c1Social },
  C2: { commercial: c2Commercial, social: c2Social },
  C3: { commercial: c3Commercial, social: c3Social },
  C4: { commercial: c4Commercial, social: c4Social },
  C5: { commercial: c5Commercial, social: c5Social },
  C6: { commercial: c6Commercial, social: c6Social },
  C7: { commercial: c7Commercial, social: c7Social },
  C8: { commercial: c8Commercial, social: c8Social },
};

export function readDimension(
  criterion: string,
  dimension: "commercial" | "social",
  answers: Answers,
  context: ProjectContext,
  evidence: EvidenceItemInput[],
  m: Methodology,
): ReadingOutcome {
  const r = READERS[criterion][dimension]({ answers, context, evidence, m });
  return { reading: r.reading, flags: Array.from(new Set(r.flags)) };
}
