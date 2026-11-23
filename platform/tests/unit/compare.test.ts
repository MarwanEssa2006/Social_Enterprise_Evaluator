// Spec TC10: reassessment under a newer methodology version separates methodology changes from project progress.
import { describe, expect, it } from "vitest";
import { compareAssessments } from "@/lib/scoring/compare";
import { runAssessment } from "@/lib/scoring/engine";
import { M1_0, registerMethodology, methodologyByVersion } from "@/lib/scoring/methodology";
import { allFirst, input } from "./helpers";

describe("Version comparison (spec §8, TC10)", () => {
  // Hypothetical M1.1 for testing only: organisation payers B2 → Strong.
  const M1_1 = { ...M1_0, version: "TEST-M1.1", lmCommercialOrganisations: ["Limited", "Strong", "Strong", "Strong", "Strong"] as const };
  registerMethodology({ ...M1_1, lmCommercialOrganisations: [...M1_1.lmCommercialOrganisations] });

  const v1Input = input({ ...allFirst(), "C1-Q1": 1, "C1-Q2": 1, "C3-Q1": 2 }); // organisations, B2; seasonal repeat
  const v1 = { version: 1, input: v1Input, result: runAssessment(v1Input, M1_0) };

  it("same inputs, newer methodology → change attributed to methodology", () => {
    const v2 = { version: 2, input: v1Input, result: runAssessment(v1Input, methodologyByVersion("TEST-M1.1")) };
    const cmp = compareAssessments(v1, v2);
    expect(cmp.methodologyChanged).toBe(true);
    const c1 = cmp.changes.find((c) => c.criterion === "C1" && c.dimension === "commercial")!;
    expect(c1.from).toBe(4);
    expect(c1.to).toBe(5);
    expect(c1.cause).toBe("methodology_change");
  });

  it("new evidence under newer methodology → project change listed separately", () => {
    const v3Input = input({ ...allFirst(), "C1-Q1": 1, "C1-Q2": 1, "C3-Q1": 0 }); // regular repeat purchase now
    const v3 = { version: 3, input: v3Input, result: runAssessment(v3Input, methodologyByVersion("TEST-M1.1")) };
    const cmp = compareAssessments(v1, v3);
    expect(cmp.changes.find((c) => c.criterion === "C1" && c.dimension === "commercial")!.cause).toBe("methodology_change");
    expect(cmp.changes.find((c) => c.criterion === "C3" && c.dimension === "commercial")!.cause).toBe("project_change");
  });

  it("same methodology, same inputs → no changes", () => {
    expect(compareAssessments(v1, { ...v1, version: 2 }).changes).toHaveLength(0);
  });
});
