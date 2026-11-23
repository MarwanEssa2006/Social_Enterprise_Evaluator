import type { Answers, CriterionId, Dimension } from "../questions/types";
import type { EvidenceItemInput } from "../evidence/kinds";

export type BeneficiaryModel = "workers" | "service_users" | "both" | "undetermined";

export interface ProjectContext {
  country: string;
  area: string;
  beneficiaryModel: BeneficiaryModel;
  grantsCoverCosts: boolean;
}

export interface AssessmentInput {
  context: ProjectContext;
  answers: Answers;
  evidence: EvidenceItemInput[];
}

export type Reading =
  | "Strong"
  | "Adequate"
  | "Limited"
  | "Weak"
  | "Absent"
  | "NotYetDetermined"
  | "Undetermined"
  | "Conflicting"
  | "NotApplicable";

export type Confidence = "High" | "Moderate" | "Low" | "StatementOnly" | "NotAssessable" | "NotApplicable";

/** Flags raised by the evaluation logic. Keys are stable identifiers used by recommendations and UI. */
export type FlagKey =
  | "provisional_qualifier_unknown"
  | "adverse_anchor_inconsistency"
  | "inconsistency"
  | "payer_not_identified"
  | "beneficiary_group_not_defined"
  | "geography_missing"
  | "evidence_basis_unknown"
  | "implausible_vs_population"
  | "grant_dependent"
  | "overheads_or_volume"
  | "untapped_recurring_need"
  | "single_supplier"
  | "import_dependency"
  | "heterogeneous_skills"
  | "non_technical_team_only"
  | "single_intermediary"
  | "consent_verification"
  | "guardian_consent"
  | "appeal_untested"
  | "supporter_appeal_only"
  | "impact_expected_not_visible"
  | "mission_preservation"
  | "plan_without_counterpart"
  | "model_conflict"
  | "delayed_beneficiary_income";

export interface DimensionResult {
  dimension: Dimension;
  reading: Reading;
  /** 1–5, or null when Not Scored / N/A. */
  score: number | null;
  status: "scored" | "not_scored" | "not_applicable";
  reason?: string; // why Not Scored / N/A
  confidence: Confidence;
  flags: FlagKey[];
  known: number; // completeness numerator
  total: number; // completeness denominator (0 when N/A)
}

export interface CriterionResult {
  id: CriterionId;
  commercial: DimensionResult;
  social: DimensionResult;
  confidence: Confidence; // criterion-level (spec §5.2)
  outcome: string; // framework §4.5 label key
}

export type Level = "High" | "Moderate" | "Low" | "NotClassifiable";

export interface DimensionOverall {
  shown: boolean;
  mean: number | null; // unrounded
  display: string | null; // one decimal, half up
  scored: number;
  applicable: number;
  minimumRequired: number;
  criteriaMet: number;
  distribution: Record<"5" | "4" | "3" | "2" | "1" | "notScored" | "na", number>;
  level: Level;
  levelReason: string;
}

export type ClassificationKey =
  | "balanced_strong"
  | "balanced_developing"
  | "social_gap"
  | "commercial_gap"
  | "weak_both"
  | "not_classified";

export interface AssessmentResult {
  methodologyVersion: string;
  criteria: CriterionResult[];
  commercial: DimensionOverall;
  social: DimensionOverall;
  classification: { key: ClassificationKey; qualifiers: string[] };
  confidence: {
    overall: Confidence;
    commercial: Confidence;
    social: Confidence;
    distribution: Record<"High" | "Moderate" | "Low" | "StatementOnly", number>;
  };
  completeness: {
    commercial: { known: number; total: number };
    social: { known: number; total: number };
    evidenceBasisStated: boolean;
    context: { complete: number; total: number };
  };
  projectFlags: string[];
}
