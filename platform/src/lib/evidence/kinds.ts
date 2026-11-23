// Evidence kinds offered to users, mapped to framework evidence classes (EVALUATION_FRAMEWORK.md §4.3.1).
export type EvidenceClass = "EV-1" | "EV-2" | "EV-3" | "EV-4" | "EV-5" | "SUPPLEMENTARY";

export interface EvidenceKind {
  id: string;
  cls: EvidenceClass;
  en: string;
  ar: string;
}

export const EVIDENCE_KINDS: readonly EvidenceKind[] = [
  { id: "sales_records", cls: "EV-1", en: "Sales records or invoices", ar: "سجلات مبيعات أو فواتير" },
  { id: "contract", cls: "EV-1", en: "Signed contract or purchase order", ar: "عقد موقّع أو أمر شراء" },
  { id: "payment_records", cls: "EV-1", en: "Payment records (e.g., to beneficiaries)", ar: "سجلات مدفوعات (مثل مدفوعات المستفيدين)" },
  { id: "purchase_records", cls: "EV-1", en: "Supplier invoices or purchase records", ar: "فواتير موردين أو سجلات شراء" },
  { id: "published_data", cls: "EV-2", en: "Published statistics or research (with source)", ar: "إحصاءات أو أبحاث منشورة (مع المصدر)" },
  { id: "population_statistic", cls: "EV-2", en: "Official population of the target area (number)", ar: "عدد السكان الرسمي للمنطقة المستهدفة (رقم)" },
  { id: "third_party_letter", cls: "EV-2", en: "Letter of interest / MoU from a named organisation", ar: "خطاب اهتمام أو مذكرة تفاهم من جهة محددة" },
  { id: "supplier_quote", cls: "EV-2", en: "Supplier quotation", ar: "عرض سعر من مورد" },
  { id: "distributor_agreement", cls: "EV-1", en: "Agreement with distributor or intermediary", ar: "اتفاق مع موزع أو وسيط" },
  { id: "survey_interviews", cls: "EV-3", en: "Survey or interviews with target group (method stated)", ar: "استبيان أو مقابلات مع الفئة المستهدفة (مع توضيح الطريقة)" },
  { id: "pilot_results", cls: "EV-3", en: "Pilot results", ar: "نتائج تجربة أولية" },
  { id: "impact_measurement", cls: "EV-3", en: "Impact measurement data (baseline / follow-up)", ar: "بيانات قياس الأثر (خط أساس / متابعة)" },
  { id: "consent_records", cls: "EV-3", en: "Beneficiary consent records", ar: "سجلات موافقة المستفيدين" },
  { id: "estimate_calculation", cls: "EV-4", en: "Estimate or calculation (with stated method)", ar: "تقدير أو حساب (مع توضيح الطريقة)" },
  { id: "plan_document", cls: "EV-4", en: "Plan document (supply, continuity, training)", ar: "وثيقة خطة (توريد، استمرار، تدريب)" },
  { id: "observation", cls: "EV-5", en: "Personal observation or experience", ar: "ملاحظة أو تجربة شخصية" },
  { id: "grant_funding", cls: "SUPPLEMENTARY", en: "Grant or donation funding (not commercial revenue)", ar: "منحة أو تبرع (ليس إيراداً تجارياً)" },
] as const;

export function evidenceKind(id: string): EvidenceKind | undefined {
  return EVIDENCE_KINDS.find((k) => k.id === id);
}

export interface EvidenceItemInput {
  id: string;
  criterion: string; // C1..C8
  dimension: "commercial" | "social";
  kind: string;
  title: string;
  description: string;
  numericValue?: number | null;
  hasFile?: boolean;
}
