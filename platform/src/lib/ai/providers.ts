import "server-only";
// Provider abstraction (TD-10). Adding a provider = implementing AiProvider; nothing else changes.
import { GoogleGenAI, ApiError } from "@google/genai";

export interface StructuredRequest {
  system: string;
  user: string;
  jsonSchema: unknown;
  maxOutputTokens: number;
  timeoutMs: number;
}

export interface StructuredResponse {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}

export class ProviderError extends Error {
  constructor(message: string, public readonly status: number | null, public readonly retryable: boolean) {
    super(message);
  }
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  generateStructured(req: StructuredRequest): Promise<StructuredResponse>;
}

/** Retry only transient failures (TD-13): 408, 429, 5xx, timeouts, network errors. */
export function isRetryableStatus(status: number | null): boolean {
  if (status === null) return true;
  return status === 408 || status === 429 || status >= 500;
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;
  constructor(apiKey: string, readonly model: string) {
    // SDK-level retries disabled; the pipeline applies its own capped policy.
    this.client = new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 } } });
  }
  async generateStructured(req: StructuredRequest): Promise<StructuredResponse> {
    try {
      const res = await this.client.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: req.user }] }],
        config: {
          systemInstruction: req.system,
          responseMimeType: "application/json",
          responseJsonSchema: req.jsonSchema,
          temperature: 0.2,
          maxOutputTokens: req.maxOutputTokens,
          httpOptions: { timeout: req.timeoutMs },
        },
      });
      const text = res.text ?? "";
      if (!text) throw new ProviderError("Empty response", null, true);
      return {
        text,
        inputTokens: res.usageMetadata?.promptTokenCount,
        outputTokens: res.usageMetadata?.candidatesTokenCount,
      };
    } catch (e) {
      if (e instanceof ProviderError) throw e;
      if (e instanceof ApiError) throw new ProviderError(`Gemini API error ${e.status}`, e.status, isRetryableStatus(e.status));
      const msg = e instanceof Error ? e.message : String(e);
      throw new ProviderError(`Gemini request failed: ${msg.slice(0, 200)}`, null, true);
    }
  }
}

export type AiMode = "mock" | "gemini";

export function resolveAiMode(): { mode: AiMode; reason: string } {
  const requested = (process.env.AI_MODE || "").toLowerCase();
  const key = process.env.GEMINI_API_KEY;
  if (requested === "mock") return { mode: "mock", reason: "AI_MODE=mock" };
  if (!key) return { mode: "mock", reason: "GEMINI_API_KEY not set" };
  if (requested === "gemini" || requested === "") return { mode: "gemini", reason: "GEMINI_API_KEY set" };
  return { mode: "mock", reason: `unknown AI_MODE ${requested}` };
}

export function geminiFromEnv(): GeminiProvider {
  return new GeminiProvider(process.env.GEMINI_API_KEY!, process.env.GEMINI_MODEL || "gemini-2.5-flash");
}
