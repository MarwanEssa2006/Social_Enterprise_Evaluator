// Answer interpretation codes — transcribed from EVALUATION_FRAMEWORK.md §6.3–13.3 (approved, D-33).
// Index i = option i (0-based, approved order). Codes are qualitative, not scores.
export type AnswerCode = "S+" | "S" | "L" | "W" | "X" | "ND" | "U" | "C" | "B1" | "B2" | "B3" | "B4" | "B5";

export const ANSWER_CODES: Record<string, readonly AnswerCode[]> = {
  // C1 Large Market
  "C1-Q1": ["C", "C", "C", "C", "C", "U"],
  "C1-Q2": ["B1", "B2", "B3", "B4", "B5", "U"],
  "C1-Q3": ["C", "C", "C", "C", "C", "C", "ND", "U"],
  "C1-Q4": ["B1", "B2", "B3", "B4", "B5", "U"],
  "C1-EF": ["C", "C", "C", "C", "C", "U"],
  // C2 High Gross Margins
  "C2-Q1": ["S+", "S", "L", "W", "W", "U"], // index 4 = cost higher than price (critical)
  "C2-Q2": ["S+", "S", "L", "W", "ND", "U"],
  "C2-Q3": ["S+", "L", "L", "W", "X", "U"], // index 2 = intermittent (ISSUE-11 rule)
  "C2-Q4": ["S+", "S", "L", "L", "X", "U"], // index 3 = needs time/investment (delayed)
  // C3 Recurring Revenue
  "C3-Q1": ["S+", "S+", "L", "S", "W", "U"], // index 3 = add-on purchases (S if need recurs, else L)
  "C3-Q2": ["S+", "S", "L", "L", "W", "U"],
  "C3-Q3": ["S+", "S", "L", "W", "X", "U"],
  "C3-Q4": ["S+", "L", "L", "W", "X", "U"],
  // C4 Leverage Our Capabilities
  "C4-Q1": ["C", "C", "C", "C", "C", "X", "U"],
  "C4-Q2": ["S+", "S", "L", "W", "W", "U"],
  "C4-Q3": ["S+", "S", "S", "W", "C", "U"], // index 4 = heterogeneous skills
  "C4-Q4": ["S+", "S", "L", "W", "W", "U"],
  // C5 Supply Chain Capabilities
  "C5-Q1": ["S", "S+", "L", "L", "W", "U"], // index 2 = single supplier
  "C5-Q2": ["S+", "S", "L", "W", "X", "U"],
  "C5-Q3": ["S+", "S", "L", "W", "W", "U"], // index 4 = fully dependent on other parties
  "C5-Q4": ["S+", "S", "L", "W", "X", "U"],
  // C6 Direct Customer Access
  "C6-Q1": ["C", "C", "C", "C", "C", "C", "X", "U"],
  "C6-Q2": ["S+", "S+", "L", "S", "X", "U"], // index 2 = single intermediary
  "C6-Q3": ["S+", "S", "L", "W", "X", "U"],
  "C6-Q4": ["S+", "S", "L", "W", "X", "U"],
  // C7 PR & Communications
  "C7-Q1": ["S+", "S", "L", "X", "U"],
  "C7-Q2": ["S+", "S", "S", "W", "ND", "U"], // index 2 = partners/supporters only (cap Adequate)
  "C7-Q3": ["S+", "S", "L", "X", "U"], // index 2 = without direct participation (consent check)
  "C7-Q4": ["S+", "S", "L", "W", "U"], // index 2 = expected, not yet visible
  // C8 Exit Strategy
  "C8-Q1": ["S+", "S", "L", "X", "U"],
  "C8-Q2": ["C", "C", "C", "C", "X", "U"], // index 1 = adoption by existing organisation
  "C8-Q3": ["S+", "S", "L", "W", "X", "U"],
  "C8-Q4": ["S+", "S+", "L", "W", "X", "U"],
};

export function codeOf(questionId: string, optionIndex: number | undefined): AnswerCode | undefined {
  if (optionIndex === undefined) return undefined;
  return ANSWER_CODES[questionId]?.[optionIndex];
}

/** Known information for completeness (spec §4): everything except U and ND. */
export function isKnown(code: AnswerCode | undefined): boolean {
  return code !== undefined && code !== "U" && code !== "ND";
}
