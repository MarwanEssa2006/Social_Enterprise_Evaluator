import { z } from "zod";

const claim = z.object({
  text: z.string().min(1).max(500),
  source_ids: z.array(z.string()).min(1).max(8),
});

export const CriterionAnalysisSchema = z.object({
  criterion: z.string(),
  summary: z.string().min(1).max(700),
  commercial_explanation: z.string().min(1).max(700),
  social_explanation: z.string().min(1).max(700),
  strengths: z.array(claim).max(4),
  weaknesses: z.array(claim).max(4),
  unsupported_assumptions: z.array(claim).max(4),
  information_gaps: z.array(claim).max(4),
  recommendations: z
    .array(
      z.object({
        library_key: z.string(),
        weakness: z.string().min(1).max(500),
        action: z.string().min(1).max(500),
        steps: z.array(z.string().min(1).max(300)).min(1).max(6),
        expected_evidence: z.array(z.string().min(1).max(200)).min(1).max(5),
        source_ids: z.array(z.string()).min(1).max(8),
      }),
    )
    .max(12),
});

export type CriterionAnalysis = z.infer<typeof CriterionAnalysisSchema>;

/** JSON Schema sent to Gemini (responseJsonSchema). */
export const CRITERION_ANALYSIS_JSON_SCHEMA = z.toJSONSchema(CriterionAnalysisSchema, { target: "draft-7" });
