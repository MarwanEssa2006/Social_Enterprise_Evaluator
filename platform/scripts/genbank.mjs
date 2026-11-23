// Generates platform/src/lib/questions/bank.ts from the machine-verified bank text.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [, , src, out] = process.argv;
const lines = readFileSync(src, "utf8").replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");

const items = [];
let cur = null;
for (const l of lines) {
  if (l.startsWith("* ")) {
    cur.options.push(l.slice(2));
  } else {
    cur = { text: l, options: [] };
    items.push(cur);
  }
}
if (items.length !== 33) throw new Error("expected 33 items, got " + items.length);

const questions = [];
let idx = 0;
for (let c = 1; c <= 8; c++) {
  for (let q = 1; q <= 4; q++) {
    const it = items[idx++];
    const m = it.text.match(/^Q([1-4])\. (.*)$/);
    if (!m || Number(m[1]) !== q) throw new Error("bad question line: " + it.text);
    questions.push({
      id: `C${c}-Q${q}`,
      criterion: `C${c}`,
      number: q,
      dimension: q <= 2 ? "commercial" : "social",
      text: m[2],
      options: it.options.map((t, k) => ({ id: `C${c}-Q${q}-O${k + 1}`, text: t })),
    });
    if (c === 1 && q === 4) {
      const ef = items[idx++];
      questions.push({
        id: "C1-EF",
        criterion: "C1",
        number: 5,
        dimension: "evidence",
        text: ef.text,
        options: ef.options.map((t, k) => ({ id: `C1-EF-O${k + 1}`, text: t })),
      });
    }
  }
}

const body = `// GENERATED from the approved question bank (EVALUATION_FRAMEWORK.md §6.1–13.1).
// Do not edit by hand. Wording and option order are approved and fixed (D-05, D-19).
import type { Question } from "./types";

export const QUESTIONS: readonly Question[] = ${JSON.stringify(questions, null, 2)} as const;
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, body, "utf8");
console.log("questions:", questions.length);
