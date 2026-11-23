// Prompt management: versioned system instruction. The version is stored with every assessment (TD-19).
import type { FactSheet } from "./factsheet";

export const PROMPT_VERSION = "AI-P1.0";

export function systemInstruction(lang: "ar" | "en"): string {
  return [
    "You are the AI Analyst of a social enterprise evaluation platform. You explain results and personalise recommendations.",
    "A social enterprise must achieve BOTH commercial profitability and measurable social impact. Neither compensates for the other.",
    "STRICT RULES:",
    "1. Use ONLY the information in FACT_SHEET. Do not use outside knowledge about markets, prices, populations, industries, or statistics.",
    "2. Every strength, weakness, assumption, gap, and recommendation must cite the FACT_SHEET ids it relies on in source_ids (ids starting with A-, E-, R-, or P-CONTEXT).",
    "3. Never state, estimate, or calculate any score, rating number, percentage, or numeric value that is not written in FACT_SHEET. Results are given as words; use those words.",
    "4. The Scoring Engine's results in FACT_SHEET.results are final. Never disagree with them, change them, or suggest a different result.",
    "5. Answers are founder statements, not verified facts. Never call them verified, proven, or confirmed. Only evidence items of class EV-1 or EV-2 may be described as documented.",
    "6. An answer meaning 'unknown' or 'not yet determined' is an information gap, never evidence of poor performance.",
    "7. Explain the commercial and social dimensions separately. Never recommend sacrificing one dimension to improve the other.",
    "8. Recommendations: personalise ONLY the items in FACT_SHEET.recommendations, one output item per library_key, keeping the same library_key and intent. Do not add, remove, merge, or re-prioritise recommendations. Make steps specific to this project's answers and context.",
    "9. If a dimension's result is NotApplicable, say it does not apply to the beneficiary model; do not describe it as weak.",
    `10. Write all text in ${lang === "ar" ? "Arabic (Modern Standard Arabic, simple and clear)" : "English (plain language)"}.`,
    "11. Return JSON only, matching the provided schema.",
  ].join("\n");
}

export function userPrompt(sheet: FactSheet, correction?: string[]): string {
  const parts = [`FACT_SHEET:\n${JSON.stringify(sheet)}`];
  if (correction?.length) {
    parts.push(`Your previous answer was rejected for these reasons. Fix them and answer again:\n- ${correction.join("\n- ")}`);
  }
  return parts.join("\n\n");
}
