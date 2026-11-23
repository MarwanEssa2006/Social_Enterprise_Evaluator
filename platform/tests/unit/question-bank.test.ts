// The question bank used by the app must equal the approved bank in EVALUATION_FRAMEWORK.md (D-05, D-19).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QUESTIONS } from "@/lib/questions/bank";
import { ANSWER_CODES } from "@/lib/questions/codes";

function bankLinesFromApp(): string[] {
  const lines: string[] = [];
  for (const q of QUESTIONS) {
    lines.push(q.id === "C1-EF" ? q.text : `Q${q.number}. ${q.text}`);
    for (const o of q.options) lines.push(`* ${o.text}`);
  }
  return lines;
}

function bankLinesFromFramework(): string[] {
  const md = readFileSync(join(__dirname, "../../../EVALUATION_FRAMEWORK.md"), "utf8").replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let inBank = false;
  for (const l of md) {
    if (/^### \d+\.1 Approved Question Bank/.test(l)) { inBank = true; continue; }
    if (l.startsWith("### ")) inBank = false;
    if (inBank && (/^Q[1-4]\. /.test(l) || l.startsWith("* ") || l.startsWith("ما الأساس"))) out.push(l);
  }
  return out;
}

describe("Approved question bank", () => {
  it("has 32 core questions and the Large Market follow-up", () => {
    expect(QUESTIONS.length).toBe(33);
    expect(QUESTIONS.filter((q) => q.id !== "C1-EF").length).toBe(32);
  });
  it("matches EVALUATION_FRAMEWORK.md exactly (wording and order)", () => {
    expect(bankLinesFromApp()).toEqual(bankLinesFromFramework());
  });
  it("every option has an interpretation code", () => {
    for (const q of QUESTIONS) expect(ANSWER_CODES[q.id]?.length).toBe(q.options.length);
  });
});
