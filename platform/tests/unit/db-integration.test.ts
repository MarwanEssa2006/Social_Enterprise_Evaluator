// Database + service integration: authorisation, submission rule (D-24), immutable versions (D-12),
// reassessment, recommendation status never changing scores (D-14).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, setDb, getDb } from "@/lib/server/db";
import * as repo from "@/lib/server/repo";
import { hashPassword, verifyPassword, hashToken } from "@/lib/server/passwords";
import { submitAssessment, SubmissionError } from "@/lib/server/assess";
import { MockProvider } from "@/lib/ai/mock";
import { allFirst } from "./helpers";

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "sev-test-"));
  setDb(openDb(join(dir, "test.db")));
});
afterAll(() => {
  getDb().close();
  setDb(null);
  rmSync(dir, { recursive: true, force: true });
});

const projectInput = { name: "Test Weaving Co-op", description: "", country: "Egypt", area: "Assiut", beneficiaryModel: "workers" as const, grantsCoverCosts: false };

describe("Passwords and sessions", () => {
  it("hashes and verifies; wrong password fails; tokens stored hashed", () => {
    const h = hashPassword("correct horse battery");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("correct horse battery", h)).toBe(true);
    expect(verifyPassword("wrong password!!", h)).toBe(false);
    expect(hashToken("abc")).toHaveLength(64);
  });
});

describe("Authorisation and versioning", () => {
  it("users cannot read each other's projects", () => {
    const a = repo.createUser("a@test.local", "A", hashPassword("password-a-123"), "ar");
    const b = repo.createUser("b@test.local", "B", hashPassword("password-b-123"), "en");
    const p = repo.createProject(a.id, projectInput);
    expect(repo.getProjectForUser(p.id, a.id)?.id).toBe(p.id);
    expect(repo.getProjectForUser(p.id, b.id)).toBeUndefined();
    expect(repo.listProjects(b.id)).toHaveLength(0);
  });

  it("submission requires every question answered (D-24)", async () => {
    const u = repo.createUser("c@test.local", "C", hashPassword("password-c-123"), "ar");
    const p = repo.createProject(u.id, projectInput);
    repo.saveDraftAnswers(p.id, { "C1-Q1": 0 });
    await expect(submitAssessment(p, u.id, "ar", new MockProvider())).rejects.toBeInstanceOf(SubmissionError);
  });

  it("creates immutable versions; reassessment adds a version; status changes never alter results", async () => {
    const u = repo.createUser("d@test.local", "D", hashPassword("password-d-123"), "ar");
    const p = repo.createProject(u.id, projectInput);
    repo.saveDraftAnswers(p.id, { ...allFirst(), "C2-Q1": 2 });
    const v1 = await submitAssessment(p, u.id, "ar", new MockProvider());
    expect(v1.version).toBe(1);

    expect(() => getDb().prepare("UPDATE assessments SET results = '{}' WHERE id = ?").run(v1.id)).toThrow(/immutable/);
    expect(() => getDb().prepare("DELETE FROM assessments WHERE id = ?").run(v1.id)).toThrow(/immutable/);

    const recs = repo.listRecommendations(v1.id);
    expect(recs.length).toBeGreaterThan(0);
    repo.setRecommendationStatus(p.id, recs[0].id, "completed");
    expect(repo.getRecommendation(p.id, recs[0].id)!.status).toBe("completed");
    expect(repo.getAssessment(p.id, 1)!.results).toBe(v1.results); // D-14: completion changes nothing
    expect(() => getDb().prepare("UPDATE recommendations SET content = '{}' WHERE id = ?").run(recs[0].id)).toThrow(/immutable/);

    repo.saveDraftAnswers(p.id, { "C2-Q1": 0 }); // improve margin answer
    const v2 = await submitAssessment(p, u.id, "ar", new MockProvider());
    expect(v2.version).toBe(2);
    expect(repo.getAssessment(p.id, 1)!.results).toBe(v1.results); // history preserved
    const r1 = JSON.parse(v1.results), r2 = JSON.parse(v2.results);
    expect(r1.criteria[1].commercial.score).toBe(3);
    expect(r2.criteria[1].commercial.score).toBe(5);
    expect(JSON.parse(v2.input_snapshot).answers["C2-Q1"]).toBe(0);
    expect(JSON.parse(v1.input_snapshot).answers["C2-Q1"]).toBe(2);
  });

  it("evidence removed from the draft stays in earlier snapshots", async () => {
    const u = repo.createUser("e@test.local", "E", hashPassword("password-e-123"), "ar");
    const p = repo.createProject(u.id, projectInput);
    repo.saveDraftAnswers(p.id, allFirst());
    const ev = repo.addEvidence(p.id, { criterion: "C2", dimension: "commercial", kind: "sales_records", title: "Invoices Q1", description: "Test invoices", numeric_value: null, file_name: null, file_path: null, file_mime: null, file_size: null });
    const v1 = await submitAssessment(p, u.id, "en", new MockProvider());
    repo.deleteEvidence(p.id, ev.id);
    expect(JSON.parse(repo.getAssessment(p.id, 1)!.input_snapshot).evidence).toHaveLength(1);
    expect(JSON.parse(v1.results).criteria[1].commercial.confidence).toBe("High");
  });
});
