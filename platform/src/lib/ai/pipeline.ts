// AI Analysis pipeline (Phase 4 components 2–7): per-criterion analysis, gap identification, recommendation
// personalisation, validation, retries, deterministic fallback, and final results assembly.
// The Scoring Engine has already produced all results; nothing here can change them.
import type { Answers } from "../questions/types";
import type { EvidenceItemInput } from "../evidence/kinds";
import type { AssessmentResult, ProjectContext } from "../scoring/types";
import type { SelectedRecommendation } from "../recommendations/select";
import type { RecText } from "../recommendations/library";
import { buildFactSheet, type Lang } from "./factsheet";
import { CRITERION_ANALYSIS_JSON_SCHEMA, type CriterionAnalysis } from "./schema";
import { PROMPT_VERSION, systemInstruction, userPrompt } from "./prompts";
import { validateAnalysis } from "./validate";
import { templateAnalysis } from "./template";
import { ProviderError, type AiProvider } from "./providers";

export interface FinalRecommendation {
  key: string;
  criterion: string;
  dimension: "commercial" | "social";
  type: string;
  priority: string;
  relatedQuestions: string[];
  relatedFlags: string[];
  base: { ar: RecText; en: RecText };
  personalised: { lang: Lang; weakness: string; action: string; steps: string[]; expected_evidence: string[]; source_ids: string[] } | null;
  source: "ai" | "template";
}

export type CriterionStatus = "ai" | "mock" | "fallback_provider_error" | "fallback_invalid_output";

export interface AnalysisResult {
  lang: Lang;
  criteria: Record<string, CriterionAnalysis & { status: CriterionStatus }>;
  recommendations: FinalRecommendation[];
  meta: {
    provider: string; model: string; promptVersion: string; mode: string;
    perCriterion: Record<string, { status: CriterionStatus; attempts: number; error?: string; inputTokens?: number; outputTokens?: number }>;
    totalInputTokens: number; totalOutputTokens: number;
  };
}

export interface PipelineOptions {
  provider: AiProvider;
  lang: Lang;
  maxAttempts?: number; // provider-error retries (TD-13)
  timeoutMs?: number;
  concurrency?: number;
  sleep?: (ms: number) => Promise<void>;
  onRun?: (r: { criterion: string; status: string; attempts: number; latencyMs: number; inputTokens?: number; outputTokens?: number; error?: string }) => void;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function analyseOne(
  sheet: ReturnType<typeof buildFactSheet>["sheet"],
  opts: Required<Pick<PipelineOptions, "provider" | "lang" | "maxAttempts" | "timeoutMs" | "sleep">>,
): Promise<{ analysis: CriterionAnalysis; status: CriterionStatus; attempts: number; error?: string; inputTokens?: number; outputTokens?: number }> {
  let attempts = 0;
  let correction: string[] | undefined;
  let correctiveRetryUsed = false;
  let inputTokens = 0, outputTokens = 0;
  for (;;) {
    attempts++;
    try {
      const res = await opts.provider.generateStructured({
        system: systemInstruction(opts.lang),
        user: userPrompt(sheet, correction),
        jsonSchema: CRITERION_ANALYSIS_JSON_SCHEMA,
        maxOutputTokens: 4096,
        timeoutMs: opts.timeoutMs,
      });
      inputTokens += res.inputTokens ?? 0;
      outputTokens += res.outputTokens ?? 0;
      const v = validateAnalysis(res.text, sheet);
      if (v.ok && v.analysis) {
        return { analysis: v.analysis, status: opts.provider.name === "mock" ? "mock" : "ai", attempts, inputTokens, outputTokens };
      }
      if (correctiveRetryUsed) {
        return { analysis: templateAnalysis(sheet), status: "fallback_invalid_output", attempts, error: v.errors.slice(0, 3).join("; "), inputTokens, outputTokens };
      }
      correctiveRetryUsed = true;
      correction = v.errors;
    } catch (e) {
      const pe = e instanceof ProviderError ? e : new ProviderError(e instanceof Error ? e.message : String(e), null, true);
      const providerAttempts = attempts - (correctiveRetryUsed ? 1 : 0);
      if (!pe.retryable || providerAttempts >= opts.maxAttempts) {
        return { analysis: templateAnalysis(sheet), status: "fallback_provider_error", attempts, error: pe.message, inputTokens, outputTokens };
      }
      const backoff = 1000 * 2 ** (providerAttempts - 1) + Math.floor(Math.random() * 250);
      await opts.sleep(backoff);
    }
  }
}

export async function runAnalysis(
  result: AssessmentResult,
  answers: Answers,
  context: ProjectContext,
  evidence: EvidenceItemInput[],
  selected: SelectedRecommendation[],
  options: PipelineOptions,
): Promise<AnalysisResult> {
  const o = {
    provider: options.provider, lang: options.lang, maxAttempts: options.maxAttempts ?? 3,
    timeoutMs: options.timeoutMs ?? 30_000, sleep: options.sleep ?? defaultSleep,
  };
  const concurrency = options.concurrency ?? 2;
  const out: AnalysisResult = {
    lang: o.lang, criteria: {}, recommendations: [],
    meta: { provider: o.provider.name, model: o.provider.model, promptVersion: PROMPT_VERSION, mode: o.provider.name, perCriterion: {}, totalInputTokens: 0, totalOutputTokens: 0 },
  };
  const queue = [...result.criteria];
  const workers = Array.from({ length: concurrency }, async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const recs = selected.filter((r) => r.criterion === c.id);
      const { sheet } = buildFactSheet(c, answers, context, evidence, recs, o.lang);
      const started = Date.now();
      const r = await analyseOne(sheet, o);
      out.criteria[c.id] = { ...r.analysis, status: r.status };
      out.meta.perCriterion[c.id] = { status: r.status, attempts: r.attempts, error: r.error, inputTokens: r.inputTokens, outputTokens: r.outputTokens };
      out.meta.totalInputTokens += r.inputTokens ?? 0;
      out.meta.totalOutputTokens += r.outputTokens ?? 0;
      options.onRun?.({ criterion: c.id, status: r.status, attempts: r.attempts, latencyMs: Date.now() - started, inputTokens: r.inputTokens, outputTokens: r.outputTokens, error: r.error });
    }
  });
  await Promise.all(workers);

  // Final results generation: every selected recommendation appears exactly once, with its deterministic
  // priority; personalised wording is attached only when it passed validation.
  out.recommendations = selected.map((s) => {
    const a = out.criteria[s.criterion];
    const p = a?.recommendations.find((r) => r.library_key === s.key);
    const fromAi = !!p && (a.status === "ai" || a.status === "mock");
    return {
      key: s.key, criterion: s.criterion, dimension: s.dimension, type: s.type, priority: s.priority,
      relatedQuestions: s.relatedQuestions, relatedFlags: s.relatedFlags, base: s.base,
      personalised: p ? { lang: o.lang, weakness: p.weakness, action: p.action, steps: p.steps, expected_evidence: p.expected_evidence, source_ids: p.source_ids } : null,
      source: fromAi && a.status === "ai" ? "ai" : "template",
    };
  });
  return out;
}
