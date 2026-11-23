export type CriterionId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8";
export type Dimension = "commercial" | "social";

export interface QuestionOption {
  readonly id: string;
  readonly text: string;
}

export interface Question {
  readonly id: string;
  readonly criterion: string;
  readonly number: number;
  readonly dimension: string; // "commercial" | "social" | "evidence"
  readonly text: string;
  readonly options: readonly QuestionOption[];
}

/** Answers keyed by question ID; value = 0-based option index in approved order. */
export type Answers = Record<string, number>;
