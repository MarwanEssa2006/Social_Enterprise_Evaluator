// Seeds realistic DUMMY data (D-39: no real personal or beneficiary data). Safe to re-run: skips if the demo user exists.
// Demo login is printed at the end; it is test-only data for local development.
import { getDb } from "../src/lib/server/db";
import * as repo from "../src/lib/server/repo";
import { hashPassword } from "../src/lib/server/passwords";
import { submitAssessment } from "../src/lib/server/assess";
import { MockProvider } from "../src/lib/ai/mock";

const DEMO_EMAIL = "demo@example.test";
const DEMO_PASSWORD = "demo-password-123";

function base(): Record<string, number> {
  const a: Record<string, number> = {};
  for (let c = 1; c <= 8; c++) for (let q = 1; q <= 4; q++) a[`C${c}-Q${q}`] = 1;
  a["C1-EF"] = 1;
  return a;
}

async function main() {
  getDb();
  if (repo.findUserByEmail(DEMO_EMAIL)) {
    console.log("Demo data already present.");
    return;
  }
  const user = repo.createUser(DEMO_EMAIL, "Demo Founder", hashPassword(DEMO_PASSWORD), "ar");
  const mock = new MockProvider();

  // 1) Handloom co-operative (workers model) — two versions showing progress.
  const p1 = repo.createProject(user.id, {
    name: "نسيج الصعيد (بيانات تجريبية)", description: "Dummy project: women-run handloom co-operative selling scarves.", country: "Egypt", area: "Assiut",
    beneficiaryModel: "workers", grantsCoverCosts: true,
  });
  repo.saveDraftAnswers(p1.id, {
    ...base(), "C1-Q1": 0, "C1-Q2": 2, "C1-Q3": 2, "C1-Q4": 3, "C1-EF": 1,
    "C2-Q1": 2, "C2-Q2": 2, "C2-Q3": 2, "C2-Q4": 2, "C3-Q1": 2, "C3-Q2": 2, "C3-Q3": 2, "C3-Q4": 2,
    "C4-Q1": 0, "C4-Q2": 1, "C4-Q3": 0, "C4-Q4": 1, "C5-Q1": 2, "C5-Q2": 1, "C5-Q3": 1, "C5-Q4": 2,
    "C6-Q1": 1, "C6-Q2": 1, "C6-Q3": 2, "C6-Q4": 2, "C7-Q1": 1, "C7-Q2": 4, "C7-Q3": 1, "C7-Q4": 1,
    "C8-Q1": 2, "C8-Q2": 0, "C8-Q3": 2, "C8-Q4": 2,
  });
  await submitAssessment(repo.getProjectForUser(p1.id, user.id)!, user.id, "ar", mock);
  repo.addEvidence(p1.id, { criterion: "C2", dimension: "commercial", kind: "estimate_calculation", title: "Unit cost sheet (dummy)", description: "Cost per scarf: yarn, dye, labour hours, packaging. Method: supplier quotes + timed production of 20 scarves.", numeric_value: null, file_name: null, file_path: null, file_mime: null, file_size: null });
  repo.addEvidence(p1.id, { criterion: "C1", dimension: "social", kind: "survey_interviews", title: "Interviews with 30 women (dummy)", description: "Structured interviews in 3 villages, March; sample and questions documented.", numeric_value: null, file_name: null, file_path: null, file_mime: null, file_size: null });
  repo.saveDraftAnswers(p1.id, { "C2-Q1": 1, "C2-Q2": 1, "C7-Q2": 1, "C6-Q1": 5 });
  await submitAssessment(repo.getProjectForUser(p1.id, user.id)!, user.id, "ar", mock);

  // 2) Learning centre (service-user model).
  const p2 = repo.createProject(user.id, {
    name: "Bright Steps Learning Hub (dummy)", description: "Dummy project: after-school tutoring paid by parents and schools.", country: "Egypt", area: "Giza",
    beneficiaryModel: "service_users", grantsCoverCosts: false,
  });
  repo.saveDraftAnswers(p2.id, {
    ...base(), "C1-Q1": 4, "C1-Q2": 3, "C1-Q3": 0, "C1-Q4": 4, "C1-EF": 2,
    "C2-Q3": 4, "C2-Q4": 4, "C3-Q1": 1, "C3-Q2": 0, "C3-Q3": 4, "C3-Q4": 4, "C4-Q3": 5, "C4-Q4": 5, "C5-Q3": 5, "C5-Q4": 5,
    "C6-Q3": 4, "C6-Q4": 4, "C7-Q3": 1, "C7-Q4": 1, "C8-Q3": 5, "C8-Q4": 5,
  });
  await submitAssessment(repo.getProjectForUser(p2.id, user.id)!, user.id, "en", mock);

  // 3) Draft project (not yet assessed) with unknown answers.
  const p3 = repo.createProject(user.id, {
    name: "Green Crates Recycling (dummy)", description: "Dummy draft project.", country: "Egypt", area: "Alexandria",
    beneficiaryModel: "undetermined", grantsCoverCosts: false,
  });
  repo.saveDraftAnswers(p3.id, { "C1-Q1": 5, "C1-Q2": 5, "C1-Q3": 7 });

  console.log("Seeded demo data. Login:", DEMO_EMAIL, "/", DEMO_PASSWORD, "(test data only)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
