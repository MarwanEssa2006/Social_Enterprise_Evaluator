// Evidence Confidence — framework §4.3.2 + SCORING_SPECIFICATION.md §5 (approved, D-26, D-37).
import { evidenceKind, type EvidenceItemInput } from "../evidence/kinds";
import type { Answers } from "../questions/types";
import type { Confidence, FlagKey } from "./types";

export const CONF_ORDER: Confidence[] = ["StatementOnly", "Low", "Moderate", "High"];
export const rank = (c: Confidence) => CONF_ORDER.indexOf(c);

export function minConf(a: Confidence, b: Confidence): Confidence {
  return rank(a) <= rank(b) ? a : b;
}
export function maxConf(a: Confidence, b: Confidence): Confidence {
  return rank(a) >= rank(b) ? a : b;
}

/** Large Market evidence follow-up (C1-EF), spec §5.1. */
function c1FollowUp(answers: Answers, dimension: "commercial" | "social"): Confidence {
  switch (answers["C1-EF"]) {
    case 0:
      return "StatementOnly"; // impression
    case 1:
      return "Low"; // personal observations
    case 2:
      return "Moderate"; // published data (High only with attached source → handled by evidence items)
    case 3:
      return "Moderate"; // interviews / surveys
    case 4:
      return dimension === "commercial" ? "Moderate" : "StatementOnly"; // sales show demand, not need size
    default:
      return "StatementOnly";
  }
}

function itemConfidence(e: EvidenceItemInput): Confidence | null {
  const k = evidenceKind(e.kind);
  if (!k) return null;
  switch (k.cls) {
    case "EV-1":
    case "EV-2":
      return "High";
    case "EV-3":
      return "Moderate";
    case "EV-4":
      return e.description.trim().length >= 20 ? "Moderate" : "Low"; // method stated?
    case "EV-5":
      return "Low";
    default:
      return null; // grants: never commercial evidence
  }
}

export function dimensionConfidence(
  criterion: string,
  dimension: "commercial" | "social",
  answers: Answers,
  evidence: EvidenceItemInput[],
  flags: FlagKey[],
): Confidence {
  let conf: Confidence = criterion === "C1" ? c1FollowUp(answers, dimension) : "StatementOnly";
  for (const e of evidence) {
    if (e.criterion !== criterion || e.dimension !== dimension) continue;
    const ic = itemConfidence(e);
    if (ic) conf = maxConf(conf, ic);
  }
  if (flags.includes("geography_missing")) conf = minConf(conf, "Low");
  if (flags.includes("inconsistency") || flags.includes("adverse_anchor_inconsistency") || flags.includes("implausible_vs_population")) {
    conf = minConf(conf, "Moderate"); // unresolved inconsistency prevents High
  }
  return conf;
}

/** Lower median of ordinal levels (spec §5.3). */
export function lowerMedian(levels: Confidence[]): Confidence | null {
  const rs = levels.filter((l) => rank(l) >= 0).map(rank).sort((a, b) => a - b);
  if (rs.length === 0) return null;
  return CONF_ORDER[rs[Math.floor((rs.length - 1) / 2)]];
}
