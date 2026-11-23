// Criterion reading rules (EVALUATION_FRAMEWORK.md §6.4–13.4) and approved refinements (spec §2, §7).
import { describe, expect, it } from "vitest";
import { evaluateCriteria, runAssessment } from "@/lib/scoring/engine";
import { allFirst, input } from "./helpers";

const evalWith = (over: Record<string, number>, ctxOver = {}, evidence: Parameters<typeof runAssessment>[0]["evidence"] = []) => {
  const i = input({ ...allFirst(), ...over }, ctxOver);
  i.evidence = evidence;
  return evaluateCriteria(i);
};
const get = (r: ReturnType<typeof evaluateCriteria>, id: string) => r.find((c) => c.id === id)!;

describe("Large Market calibration (spec §7.2)", () => {
  it("individual payers: B2 → Limited; organisations: B1 → Limited, B3 → Strong", () => {
    expect(get(evalWith({ "C1-Q1": 0, "C1-Q2": 1 }), "C1").commercial.reading).toBe("Limited");
    expect(get(evalWith({ "C1-Q1": 1, "C1-Q2": 0 }), "C1").commercial.reading).toBe("Limited");
    expect(get(evalWith({ "C1-Q1": 3, "C1-Q2": 2 }), "C1").commercial.reading).toBe("Strong");
    expect(get(evalWith({ "C1-Q1": 4, "C1-Q2": 2 }), "C1").commercial.reading).toBe("Limited"); // "more than one" → individuals column
  });
  it("social: B3 → Limited, B5 → Strong; unknown → Not Scored, never zero", () => {
    expect(get(evalWith({ "C1-Q4": 2 }), "C1").social.score).toBe(3);
    const u = get(evalWith({ "C1-Q4": 5 }), "C1").social;
    expect(u.status).toBe("not_scored");
    expect(u.score).toBeNull();
    expect(u.reason).toBe("unknown");
  });
  it("payer unknown with large band → Conflicting (Not Scored)", () => {
    expect(get(evalWith({ "C1-Q1": 5, "C1-Q2": 4 }), "C1").commercial.reading).toBe("Conflicting");
  });
  it("TC9-c: affected count above attached area population → Not Scored", () => {
    const r = evalWith({ "C1-Q4": 4 }, {}, [
      { id: "e1", criterion: "C1", dimension: "social", kind: "population_statistic", title: "District pop.", description: "CAPMAS 2024", numericValue: 6000 },
    ]);
    expect(get(r, "C1").social.reading).toBe("Conflicting");
    expect(get(r, "C1").social.flags).toContain("implausible_vs_population");
  });
  it("missing geography caps confidence at Low and flags it", () => {
    const r = evalWith({}, { area: "" }, [
      { id: "e1", criterion: "C1", dimension: "social", kind: "published_data", title: "x", description: "y" },
    ]);
    expect(get(r, "C1").social.flags).toContain("geography_missing");
    expect(get(r, "C1").social.confidence).toBe("Low");
  });
});

describe("High Gross Margins", () => {
  it("cost > price with growth claimed → Weak (adverse-anchor rule), not Not Scored", () => {
    const c2 = get(evalWith({ "C2-Q1": 4, "C2-Q2": 0 }), "C2").commercial;
    expect(c2.reading).toBe("Weak");
    expect(c2.score).toBe(2);
    expect(c2.flags).toContain("adverse_anchor_inconsistency");
  });
  it("unknown margin with coverage claimed → Conflicting", () => {
    expect(get(evalWith({ "C2-Q1": 5, "C2-Q2": 0 }), "C2").commercial.reading).toBe("Conflicting");
  });
  it("good margin, does not cover costs → Limited with overheads flag", () => {
    const c2 = get(evalWith({ "C2-Q1": 0, "C2-Q2": 3 }), "C2").commercial;
    expect(c2.reading).toBe("Limited");
    expect(c2.flags).toContain("overheads_or_volume");
  });
  it("ISSUE-11: intermittent income reads adequacy from Q4 only", () => {
    expect(get(evalWith({ "C2-Q3": 2, "C2-Q4": 0 }), "C2").social.reading).toBe("Strong");
    expect(get(evalWith({ "C2-Q3": 2, "C2-Q4": 2 }), "C2").social.reading).toBe("Limited");
  });
  it("grant-dependent flag raised when grants cover costs and margin is weak", () => {
    const r = runAssessment({ ...input({ ...allFirst(), "C2-Q1": 4, "C2-Q2": 0 }, { grantsCoverCosts: true }) });
    expect(r.projectFlags).toContain("grant_dependent");
    expect(r.commercial.level).toBe("Low");
  });
});

describe("Recurring Revenue", () => {
  it("one-off purchase with recurring need → Limited (untapped), not conflict", () => {
    const c3 = get(evalWith({ "C3-Q1": 4, "C3-Q2": 0 }), "C3").commercial;
    expect(c3.reading).toBe("Limited");
    expect(c3.flags).toContain("untapped_recurring_need");
  });
  it("subscription but no repeat need → Conflicting", () => {
    expect(get(evalWith({ "C3-Q1": 1, "C3-Q2": 4 }), "C3").commercial.reading).toBe("Conflicting");
  });
});

describe("Other criteria rules", () => {
  it("C4: no capabilities but 'most capabilities' → Conflicting", () => {
    expect(get(evalWith({ "C4-Q1": 5, "C4-Q2": 0 }), "C4").commercial.reading).toBe("Conflicting");
  });
  it("C5: single supplier caps at Adequate", () => {
    const c5 = get(evalWith({ "C5-Q1": 2, "C5-Q2": 0 }), "C5").commercial;
    expect(c5.reading).toBe("Adequate");
    expect(c5.flags).toContain("single_supplier");
  });
  it("C6: direct sales but single intermediary → Conflicting; agreement evidence lifts single intermediary to Adequate", () => {
    expect(get(evalWith({ "C6-Q1": 0, "C6-Q2": 2 }), "C6").commercial.reading).toBe("Conflicting");
    expect(get(evalWith({ "C6-Q1": 3, "C6-Q2": 2 }), "C6").commercial.reading).toBe("Limited");
    const withAgreement = evalWith({ "C6-Q1": 3, "C6-Q2": 2 }, {}, [
      { id: "e", criterion: "C6", dimension: "commercial", kind: "distributor_agreement", title: "a", description: "b" },
    ]);
    expect(get(withAgreement, "C6").commercial.reading).toBe("Adequate");
  });
  it("C6: no channel and no route → Absent (1)", () => {
    expect(get(evalWith({ "C6-Q1": 6, "C6-Q2": 4 }), "C6").commercial.score).toBe(1);
  });
  it("C7: stories without participation capped at Adequate with consent check", () => {
    const s = get(evalWith({ "C7-Q3": 2, "C7-Q4": 0 }), "C7").social;
    expect(s.reading).toBe("Adequate");
    expect(s.flags).toContain("consent_verification");
  });
  it("C8: beneficiaries continue independently but depend on founders → Conflicting", () => {
    expect(get(evalWith({ "C8-Q3": 3, "C8-Q4": 0 }), "C8").social.reading).toBe("Conflicting");
  });
  it("Not yet determined is Not Scored (D-36)", () => {
    const c2 = get(evalWith({ "C7-Q2": 4, "C7-Q1": 5 }), "C7").commercial;
    expect(c2.status).toBe("not_scored");
  });
});

describe("Beneficiary model (framework §4.0.2)", () => {
  it("service users: C2–C6, C8 social N/A; C1 and C7 always applicable", () => {
    const r = evalWith({ "C2-Q3": 4, "C2-Q4": 4, "C3-Q3": 4, "C3-Q4": 4, "C4-Q3": 5, "C4-Q4": 5, "C5-Q3": 5, "C5-Q4": 4, "C6-Q3": 4, "C6-Q4": 4, "C8-Q3": 4, "C8-Q4": 4 }, { beneficiaryModel: "service_users" });
    for (const id of ["C2", "C3", "C4", "C5", "C6", "C8"]) expect(get(r, id).social.status).toBe("not_applicable");
    expect(get(r, "C1").social.status).toBe("scored");
    expect(get(r, "C7").social.status).toBe("scored");
  });
  it("model conflict: earning answer on an N/A dimension → treated as applicable, negative kept", () => {
    const r = evalWith({ "C2-Q3": 3, "C2-Q4": 2 }, { beneficiaryModel: "service_users" });
    const s = get(r, "C2").social;
    expect(s.status).toBe("scored");
    expect(s.reading).toBe("Weak");
    expect(s.flags).toContain("model_conflict");
  });
  it("undetermined model never produces N/A", () => {
    const r = evalWith({}, { beneficiaryModel: "undetermined" });
    expect(r.every((c) => c.social.status !== "not_applicable")).toBe(true);
  });
});

describe("Determinism and completeness", () => {
  it("same input → identical result", () => {
    const i = input(allFirst());
    expect(JSON.stringify(runAssessment(i))).toBe(JSON.stringify(runAssessment(i)));
  });
  it("completeness counts unknown answers as not known", () => {
    const r = runAssessment(input({ ...allFirst(), "C2-Q1": 5, "C3-Q2": 5 }));
    expect(r.completeness.commercial).toEqual({ known: 14, total: 16 });
  });
});
