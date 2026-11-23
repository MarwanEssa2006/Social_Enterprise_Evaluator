import type { CriterionId } from "./types";
import { QUESTIONS } from "./bank";

export interface CriterionMeta {
  id: CriterionId;
  nameEn: string;
  nameAr: string; // question bank name (D-19)
  templateNameAr: string; // name as written in Alan's template (ISSUE-05)
  /** Response cell (top-left of merged area) in Alan's template — TD-22. */
  templateCell: string;
}

export const CRITERIA: readonly CriterionMeta[] = [
  { id: "C1", nameEn: "Large Market", nameAr: "سوق كبير", templateNameAr: "سوق كبير", templateCell: "C5" },
  { id: "C2", nameEn: "High Gross Margins", nameAr: "هوامش ربح كبيرة", templateNameAr: "هوامش ربح كبيرة", templateCell: "F5" },
  { id: "C3", nameEn: "Recurring Revenue", nameAr: "إيرادات متكررة قوية", templateNameAr: "إيرادات متكررة قوية", templateCell: "I5" },
  { id: "C4", nameEn: "Leverage Our Capabilities", nameAr: "الاستفادة من قدراتنا", templateNameAr: "الأستفادة من قدراتنا", templateCell: "L5" },
  { id: "C5", nameEn: "Supply Chain Capabilities", nameAr: "قدرات سلسلة التوريد", templateNameAr: "قدرات سلسله التوريد", templateCell: "C14" },
  { id: "C6", nameEn: "Direct Customer Access", nameAr: "الوصول المباشر إلى العميل", templateNameAr: "الوصول المباشر الى العميل", templateCell: "F14" },
  { id: "C7", nameEn: "PR & Communications", nameAr: "البعد الإعلامي والتواصلي", templateNameAr: "البعد الأعلامي و التواصلي", templateCell: "I14" },
  { id: "C8", nameEn: "Exit Strategy", nameAr: "استراتيجية الخروج والاستمرار", templateNameAr: "استراتيجية الخروج/ الاستتثمار", templateCell: "L14" },
] as const;

export const CRITERION_IDS: readonly CriterionId[] = CRITERIA.map((c) => c.id);

export function criterionMeta(id: string): CriterionMeta {
  const c = CRITERIA.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown criterion ${id}`);
  return c;
}

export function questionsFor(criterion: string) {
  return QUESTIONS.filter((q) => q.criterion === criterion);
}

export function questionById(id: string) {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
}

/** All questions that must be answered before submission (D-24): 32 core + C1-EF. */
export const REQUIRED_QUESTION_IDS: readonly string[] = QUESTIONS.map((q) => q.id);
