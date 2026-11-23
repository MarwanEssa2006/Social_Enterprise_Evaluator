// AI layer tests: validation, grounding, retries, fallback, and score immutability (Phase 4 test plan).
import { describe, expect, it, vi } from "vitest";
import { runAssessment } from "@/lib/scoring/engine";
import { selectRecommendations } from "@/lib/recommendations/select";
import { buildFactSheet } from "@/lib/ai/factsheet";
import { validateAnalysis } from "@/lib/ai/validate";
import { templateAnalysis } from "@/lib/ai/template";
import { runAnalysis } from "@/lib/ai/pipeline";
import { MockProvider } from "@/lib/ai/mock";
import { ProviderError, type AiProvider } from "@/lib/ai/providers";
import { allFirst, input } from "./helpers";

const scenario = () => {
  const i = input({ ...allFirst(), "C2-Q1": 4, "C2-Q2": 0, "C3-Q2": 5, "C6-Q1": 6, "C6-Q2": 4 }, { grantsCoverCosts: true });
  const result = runAssessment(i);
  const selected = selectRecommendations(result.criteria, i.answers);
  return { i, result, selected };
};

function sheetFor(id: string, lang: "ar" | "en" = "en") {
  const { i, result, selected } = scenario();
  const c = result.criteria.find((x) => x.id === id)!;
  return buildFactSheet(c, i.answers, i.context, i.evidence, selected.filter((s) => s.criterion === id), lang).sheet;
}

class ScriptedProvider implements AiProvider {
  readonly name = "gemini";
  readonly model = "test";
  calls = 0;
  constructor(private script: ((user: string) => string | Error)[]) {}
  async generateStructured(req: { user: string }) {
    const step = this.script[Math.min(this.calls, this.script.length - 1)];
    this.calls++;
    const r = step(req.user);
    if (r instanceof Error) throw r;
    return { text: r };
  }
}
const validFor = (user: string) => {
  const sheet = JSON.parse(user.match(/^FACT_SHEET:\n(.*?)(\n\n|$)/s)![1]);
  return JSON.stringify(templateAnalysis(sheet));
};
const noSleep = vi.fn(async () => {});

describe("Recommendation selection", () => {
  it("selects grounded, prioritised entries; gatekeeper weakness is high priority", () => {
    const { selected } = scenario();
    const grant = selected.find((s) => s.key === "C2-COM-GRANT")!;
    expect(grant.priority).toBe("high");
    expect(selected.find((s) => s.key === "C6-COM-NOCHANNEL")).toBeTruthy();
    expect(selected.find((s) => s.key === "C3-COM-INFO")).toBeTruthy(); // unknown answer → information gap
    expect(new Set(selected.map((s) => s.key)).size).toBe(selected.length);
  });
  it("no social recommendations for N/A dimensions", () => {
    const i = input({ ...allFirst(), "C2-Q3": 4, "C2-Q4": 4 }, { beneficiaryModel: "service_users" });
    const r = runAssessment(i);
    const sel = selectRecommendations(r.criteria, i.answers);
    expect(sel.some((s) => s.criterion === "C2" && s.dimension === "social")).toBe(false);
  });
});

describe("Output validator", () => {
  const sheet = sheetFor("C1");
  const good = templateAnalysis(sheet);
  it("accepts the grounded template output (EN and AR)", () => {
    expect(validateAnalysis(JSON.stringify(good), sheet).ok).toBe(true);
    const ar = sheetFor("C1", "ar");
    expect(validateAnalysis(JSON.stringify(templateAnalysis(ar)), ar).ok).toBe(true);
  });
  it("rejects invalid JSON", () => {
    expect(validateAnalysis("{not json", sheet).errors[0]).toMatch(/not valid JSON/);
  });
  it("rejects invented market numbers (hallucination)", () => {
    const bad = { ...good, summary: "There are 48,500 potential customers in the area." };
    const v = validateAnalysis(JSON.stringify(bad), sheet);
    expect(v.ok).toBe(false);
    expect(v.errors.join()).toMatch(/48500/);
  });
  it("rejects score statements", () => {
    const bad = { ...good, summary: "This criterion scores well." };
    expect(validateAnalysis(JSON.stringify(bad), sheet).ok).toBe(false);
  });
  it("rejects unknown source ids", () => {
    const bad = { ...good, strengths: [{ text: "Strong demand.", source_ids: ["E-FAKE-9"] }] };
    expect(validateAnalysis(JSON.stringify(bad), sheet).errors.join()).toMatch(/unknown source id/);
  });
  it("rejects calling founder statements verified", () => {
    const bad = { ...good, strengths: [{ text: "Market size is verified.", source_ids: ["A-C1-Q2"] }] };
    expect(validateAnalysis(JSON.stringify(bad), sheet).errors.join()).toMatch(/verified/);
  });
  it("rejects recommendations not selected by the library, and generic ones", () => {
    const extra = { ...good, recommendations: [...good.recommendations, { ...good.recommendations[0] ?? { weakness: "w", action: "a", steps: ["s"], expected_evidence: ["e"], source_ids: ["A-C1-Q1"] }, library_key: "C9-INVENTED" }] };
    expect(validateAnalysis(JSON.stringify(extra), sheet).errors.join()).toMatch(/not selected/);
    if (good.recommendations.length) {
      const generic = { ...good, recommendations: [{ ...good.recommendations[0], source_ids: ["R-C1-COM"] }] };
      expect(validateAnalysis(JSON.stringify(generic), sheet).errors.join()).toMatch(/project-specific/);
    }
  });
});

describe("Pipeline", () => {
  it("mock mode: all 8 criteria analysed independently; every selected recommendation present once", async () => {
    const { i, result, selected } = scenario();
    const before = JSON.stringify(result);
    const out = await runAnalysis(result, i.answers, i.context, i.evidence, selected, { provider: new MockProvider(), lang: "ar", sleep: noSleep });
    expect(Object.keys(out.criteria).sort()).toEqual(["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"]);
    expect(Object.values(out.meta.perCriterion).every((p) => p.status === "mock")).toBe(true);
    expect(out.recommendations.map((r) => r.key)).toEqual(selected.map((s) => s.key));
    expect(JSON.stringify(result)).toBe(before); // AI never changes scoring results
  });

  it("429 twice then success → retried with backoff, status ai", async () => {
    const { i, result, selected } = scenario();
    const p = new ScriptedProvider([() => new ProviderError("rate", 429, true), () => new ProviderError("rate", 429, true), validFor]);
    const sleep = vi.fn(async () => {});
    const out = await runAnalysis({ ...result, criteria: [result.criteria[0]] }, i.answers, i.context, i.evidence, selected, { provider: p, lang: "en", sleep, concurrency: 1 });
    expect(out.meta.perCriterion.C1.status).toBe("ai");
    expect(out.meta.perCriterion.C1.attempts).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("400 is not retried → deterministic fallback", async () => {
    const { i, result, selected } = scenario();
    const p = new ScriptedProvider([() => new ProviderError("bad request", 400, false)]);
    const out = await runAnalysis({ ...result, criteria: [result.criteria[0]] }, i.answers, i.context, i.evidence, selected, { provider: p, lang: "en", sleep: noSleep, concurrency: 1 });
    expect(p.calls).toBe(1);
    expect(out.meta.perCriterion.C1.status).toBe("fallback_provider_error");
    expect(out.criteria.C1.summary.length).toBeGreaterThan(0);
  });

  it("persistent 503 → stops after 3 attempts and falls back", async () => {
    const { i, result, selected } = scenario();
    const p = new ScriptedProvider([() => new ProviderError("unavailable", 503, true)]);
    const out = await runAnalysis({ ...result, criteria: [result.criteria[0]] }, i.answers, i.context, i.evidence, selected, { provider: p, lang: "en", sleep: noSleep, concurrency: 1 });
    expect(p.calls).toBe(3);
    expect(out.meta.perCriterion.C1.status).toBe("fallback_provider_error");
  });

  it("invalid JSON then valid → one corrective retry succeeds", async () => {
    const { i, result, selected } = scenario();
    const p = new ScriptedProvider([() => "not json", validFor]);
    const out = await runAnalysis({ ...result, criteria: [result.criteria[0]] }, i.answers, i.context, i.evidence, selected, { provider: p, lang: "en", sleep: noSleep, concurrency: 1 });
    expect(out.meta.perCriterion.C1.status).toBe("ai");
    expect(p.calls).toBe(2);
  });

  it("hallucinating twice → fallback, invented number never reaches results", async () => {
    const { i, result, selected } = scenario();
    const hallucinate = (user: string) => {
      const ok = JSON.parse(validFor(user));
      ok.summary = "Published data show 73,000 affected people.";
      return JSON.stringify(ok);
    };
    const p = new ScriptedProvider([hallucinate]);
    const out = await runAnalysis({ ...result, criteria: [result.criteria[0]] }, i.answers, i.context, i.evidence, selected, { provider: p, lang: "en", sleep: noSleep, concurrency: 1 });
    expect(out.meta.perCriterion.C1.status).toBe("fallback_invalid_output");
    expect(JSON.stringify(out)).not.toContain("73,000");
  });
});
