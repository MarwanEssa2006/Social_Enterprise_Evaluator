// SCORING_SPECIFICATION.md §9 test cases (approved methodology M1.0). Expected values are from the specification.
import { describe, expect, it } from "vitest";
import { aggregate } from "@/lib/scoring/engine";
import { crit, input } from "./helpers";

const agg = (com: Parameters<typeof crit>[0], soc: Parameters<typeof crit>[1], ctxOverrides = {}, conf?: Parameters<typeof crit>[2]) =>
  aggregate(crit(com, soc, conf), input({}, ctxOverrides));

describe("Spec §9 test cases", () => {
  it("TC1 strong commercial / weak social → Social Gap", () => {
    const r = agg([5, 5, 4, 4, 4, 5, 4, 4], [3, 2, 2, 3, 2, 2, 3, 2]);
    expect(r.commercial.display).toBe("4.4");
    expect(r.commercial.criteriaMet).toBe(8);
    expect(r.commercial.level).toBe("High");
    expect(r.social.display).toBe("2.4");
    expect(r.social.level).toBe("Low");
    expect(r.classification.key).toBe("social_gap");
  });

  it("TC2 weak commercial / strong social → Commercial Gap", () => {
    const r = agg([3, 2, 3, 4, 3, 2, 4, 2], [5, 4, 5, 4, 4, 5, 5, 4]);
    expect(r.commercial.display).toBe("2.9");
    expect(r.commercial.level).toBe("Low");
    expect(r.social.display).toBe("4.5");
    expect(r.social.level).toBe("High");
    expect(r.classification.key).toBe("commercial_gap");
  });

  it("TC3 grant-dependent with negative margin → Commercial Gap (gatekeeper), mean alone would mislead", () => {
    const r = agg([4, 2, 4, 4, 4, 4, 5, 4], [4, 4, 4, 4, 4, 4, 4, 4], { grantsCoverCosts: true });
    expect(r.commercial.display).toBe("3.9");
    expect(r.commercial.level).toBe("Low");
    expect(r.commercial.levelReason).toBe("gatekeeper_weak");
    expect(r.social.level).toBe("High");
    expect(r.classification.key).toBe("commercial_gap");
    expect(r.projectFlags).toContain("grant_dependent");
  });

  it("TC3-b gatekeeper not scored → Not Classified", () => {
    const r = agg([4, "CF", 4, 4, 4, 4, 5, 4], [4, 4, 4, 4, 4, 4, 4, 4]);
    expect(r.commercial.level).toBe("NotClassifiable");
    expect(r.classification.key).toBe("not_classified");
  });

  it("TC4 mostly unknown → overall Not Scored, Not Classified (no misleading 4.3)", () => {
    const r = agg([4, "NS", "NS", 4, "NS", "NS", 5, "NS"], [4, "NS", "NS", "NS", "NS", "NS", 4, "NS"]);
    expect(r.commercial.shown).toBe(false);
    expect(r.commercial.display).toBeNull();
    expect(r.social.shown).toBe(false);
    expect(r.classification.key).toBe("not_classified");
  });

  it("TC5 service-user model: 2 of 8 applicable, Balanced — Strong with limited coverage qualifier", () => {
    const r = agg([4, 4, 4, 5, 4, 4, 4, 4], [5, "NA", "NA", "NA", "NA", "NA", 4, "NA"], { beneficiaryModel: "service_users" });
    expect(r.commercial.display).toBe("4.1");
    expect(r.social.applicable).toBe(2);
    expect(r.social.minimumRequired).toBe(2);
    expect(r.social.display).toBe("4.5");
    expect(r.classification.key).toBe("balanced_strong");
    expect(r.classification.qualifiers).toContain("limited_social_coverage");
    expect(r.social.distribution.na).toBe(6);
  });

  it("TC5-b service-user with C7 social unknown → Not Classified", () => {
    const r = agg([4, 4, 4, 5, 4, 4, 4, 4], [5, "NA", "NA", "NA", "NA", "NA", "NS", "NA"], { beneficiaryModel: "service_users" });
    expect(r.social.shown).toBe(false);
    expect(r.classification.key).toBe("not_classified");
    expect(r.projectFlags).toContain("social_impact_not_demonstrated");
  });

  it("TC6 conflicts on non-gatekeepers are excluded → Balanced — Developing", () => {
    const r = agg([4, 4, 3, 4, 4, "CF", 3, 3], [4, 3, 3, "CF", 4, 3, 4, 3]);
    expect(r.commercial.display).toBe("3.6");
    expect(r.commercial.scored).toBe(7);
    expect(r.social.display).toBe("3.4");
    expect(r.classification.key).toBe("balanced_developing");
    expect(r.projectFlags).toContain("unresolved_conflicts:2");
  });

  it("TC7 model conflict keeps negative beneficiary income visible", () => {
    const r = agg([4, 4, 4, 5, 4, 4, 4, 4], [4, 2, "NA", "NA", "NA", "NA", 4, "NA"], { beneficiaryModel: "service_users" });
    expect(r.social.applicable).toBe(3);
    expect(r.social.minimumRequired).toBe(3);
    expect(r.social.display).toBe("3.3");
    expect(r.social.level).toBe("Moderate");
    expect(r.classification.key).toBe("balanced_developing");
  });

  it("TC8 undetermined model: all 8 social applicable; Absent scored 1", () => {
    const r = agg([4, 4, 4, 4, 4, 4, 4, 4], [4, 1, 4, 4, 4, 4, 4, 4], { beneficiaryModel: "undetermined" });
    expect(r.social.applicable).toBe(8);
    expect(r.social.display).toBe("3.6");
    expect(r.social.level).toBe("Moderate");
    expect(r.completeness.context.complete).toBe(2);
  });

  it("TC11 positive classification on statements only carries the founder-statements qualifier", () => {
    const r = agg([5, 5, 4, 4, 5, 4, 5, 4], [5, 4, 4, 5, 4, 4, 5, 4], {}, "StatementOnly");
    expect(r.classification.key).toBe("balanced_strong");
    expect(r.confidence.overall).toBe("StatementOnly");
    expect(r.classification.qualifiers).toContain("mainly_founder_statements");
  });

  it("TC12 stated absences scored 1 → Commercial Gap", () => {
    const r = agg([4, 3, 3, 3, 3, 1, 3, 1], [4, 3, 4, 3, 4, 3, 4, 3]);
    expect(r.commercial.display).toBe("2.6");
    expect(r.commercial.level).toBe("Low");
    expect(r.classification.key).toBe("commercial_gap");
  });

  it("Weak on both", () => {
    const r = agg([2, 2, 3, 2, 3, 2, 2, 3], [2, 3, 2, 2, 3, 2, 2, 3]);
    expect(r.classification.key).toBe("weak_both");
  });

  it("grant-dependent flag blocks commercial High even with high mean", () => {
    const r = agg([5, 3, 5, 5, 5, 5, 5, 5], [5, 5, 5, 5, 5, 5, 5, 5], { grantsCoverCosts: true });
    expect(r.commercial.mean).toBeGreaterThanOrEqual(4);
    expect(r.commercial.level).toBe("Moderate");
  });

  it("N/A and Not Scored are never counted as zero", () => {
    const r = agg([5, 5, 5, 5, 5, 5, "NS", "NS"], [5, "NA", "NA", "NA", "NA", "NA", 5, "NA"], { beneficiaryModel: "service_users" });
    expect(r.commercial.mean).toBe(5);
    expect(r.social.mean).toBe(5);
  });
});

describe("Confidence roll-up (spec §5)", () => {
  it("overall = lower median, capped at gatekeeper confidence", () => {
    const criteria = crit([4, 4, 4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4, 4, 4], "High");
    criteria[1].commercial.confidence = "Low"; // C2 gatekeeper
    const r = aggregate(criteria, input());
    expect(r.confidence.overall).toBe("Low");
    expect(r.confidence.distribution.High).toBe(15);
  });
  it("lower median used when no gatekeeper is lower", () => {
    const criteria = crit([4, 4, 4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4, 4, 4], "High");
    for (const i of [2, 3, 4, 5, 7]) criteria[i].commercial.confidence = "StatementOnly";
    for (const i of [1, 2, 3]) criteria[i].social.confidence = "StatementOnly";
    const r = aggregate(criteria, input());
    expect(r.confidence.overall).toBe("StatementOnly");
  });
});
