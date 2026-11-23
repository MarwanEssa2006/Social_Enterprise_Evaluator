import "server-only";
// Assessment submission service: deterministic scoring → library selection → AI personalisation →
// insert-only version. Scores are computed before and independently of any AI call.
import { REQUIRED_QUESTION_IDS } from "../questions/criteria";
import { runAssessment } from "../scoring/engine";
import type { AssessmentInput, AssessmentResult, BeneficiaryModel } from "../scoring/types";
import { selectRecommendations } from "../recommendations/select";
import { runAnalysis, type AnalysisResult } from "../ai/pipeline";
import { MockProvider } from "../ai/mock";
import { geminiFromEnv, resolveAiMode, type AiProvider } from "../ai/providers";
import {
  evidenceToInput, getDraftAnswers, insertAssessment, listEvidence, logAiRun,
  type AssessmentRow, type ProjectRow,
} from "./repo";

export function missingQuestions(answers: Record<string, number>): string[] {
  return REQUIRED_QUESTION_IDS.filter((id) => answers[id] === undefined);
}

export function buildInput(project: ProjectRow): AssessmentInput {
  return {
    context: {
      country: project.country, area: project.area,
      beneficiaryModel: project.beneficiary_model as BeneficiaryModel, grantsCoverCosts: !!project.grants_cover_costs,
    },
    answers: getDraftAnswers(project.id),
    evidence: evidenceToInput(listEvidence(project.id)),
  };
}

export function providerFromEnv(): { provider: AiProvider; mode: string; reason: string } {
  const { mode, reason } = resolveAiMode();
  return { provider: mode === "gemini" ? geminiFromEnv() : new MockProvider(), mode, reason };
}

export class SubmissionError extends Error {
  constructor(public readonly missing: string[]) {
    super("Unanswered questions");
  }
}

export async function submitAssessment(project: ProjectRow, userId: string, locale: "ar" | "en", provider?: AiProvider): Promise<AssessmentRow> {
  const input = buildInput(project);
  const missing = missingQuestions(input.answers);
  if (missing.length) throw new SubmissionError(missing); // D-24

  const result: AssessmentResult = runAssessment(input);
  const selected = selectRecommendations(result.criteria, input.answers);
  const p = provider ? { provider, mode: provider.name, reason: "injected" } : providerFromEnv();
  const analysis: AnalysisResult = await runAnalysis(result, input.answers, input.context, input.evidence, selected, {
    provider: p.provider,
    lang: locale,
    onRun: (r) =>
      logAiRun({
        projectId: project.id, criterion: r.criterion, provider: p.provider.name, model: p.provider.model,
        promptVersion: "AI-P1.0", status: r.status, attempts: r.attempts, inputTokens: r.inputTokens,
        outputTokens: r.outputTokens, latencyMs: r.latencyMs, error: r.error,
      }),
  });

  return insertAssessment({
    projectId: project.id,
    methodologyVersion: result.methodologyVersion,
    inputSnapshot: input,
    results: result,
    analysis: { lang: analysis.lang, criteria: analysis.criteria },
    aiMeta: { ...analysis.meta, modeReason: p.reason },
    locale,
    createdBy: userId,
    recommendations: analysis.recommendations.map((r) => ({
      rec_key: r.key, criterion: r.criterion, dimension: r.dimension, priority: r.priority, content: r,
    })),
  });
}
