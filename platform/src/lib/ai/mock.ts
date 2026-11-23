// Mock AI provider (D-39, TD-10): safe default with no network calls. Produces deterministic text from the
// fact sheet and goes through the same validation path as a live provider.
import type { AiProvider, StructuredRequest, StructuredResponse } from "./providers";
import type { FactSheet } from "./factsheet";
import { templateAnalysis } from "./template";

export class MockProvider implements AiProvider {
  readonly name = "mock";
  readonly model = "mock-template-v1";
  async generateStructured(req: StructuredRequest): Promise<StructuredResponse> {
    const m = req.user.match(/^FACT_SHEET:\n(.*?)(\n\n|$)/s);
    if (!m) throw new Error("Mock provider: no FACT_SHEET in prompt");
    const sheet = JSON.parse(m[1]) as FactSheet;
    const text = JSON.stringify(templateAnalysis(sheet));
    return { text, inputTokens: Math.ceil(req.user.length / 4), outputTokens: Math.ceil(text.length / 4) };
  }
}
