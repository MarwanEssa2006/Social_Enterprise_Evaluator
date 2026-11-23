import "server-only";
// Demo data (dummy only, D-39). Fixed IDs so every server instance in demo mode builds identical data:
// the demo account and its project links work no matter which instance serves the request.
import * as repo from "./repo";
import { hashPassword } from "./passwords";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./mode";
import { runAssessment } from "../scoring/engine";
import { selectRecommendations } from "../recommendations/select";
import { templateAnalysisSync } from "../ai/pipeline";
import type { AssessmentInput, BeneficiaryModel } from "../scoring/types";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const P1 = "00000000-0000-4000-8000-0000000000a1";
const P2 = "00000000-0000-4000-8000-0000000000a2";
const P3 = "00000000-0000-4000-8000-0000000000a3";

function base(): Record<string, number> {
  const a: Record<string, number> = {};
  for (let c = 1; c <= 8; c++) for (let q = 1; q <= 4; q++) a[`C${c}-Q${q}`] = 1;
  a["C1-EF"] = 1;
  return a;
}

/** Saves a version from the current draft using template analysis (no AI call; synchronous). */
function assessNow(projectId: string, locale: "ar" | "en") {
  const p = repo.getProjectForUser(projectId, DEMO_USER_ID)!;
  const input: AssessmentInput = {
    context: { country: p.country, area: p.area, beneficiaryModel: p.beneficiary_model as BeneficiaryModel, grantsCoverCosts: !!p.grants_cover_costs },
    answers: repo.getDraftAnswers(p.id),
    evidence: repo.evidenceToInput(repo.listEvidence(p.id)),
  };
  const result = runAssessment(input);
  const selected = selectRecommendations(result.criteria, input.answers);
  const analysis = templateAnalysisSync(result, input.answers, input.context, input.evidence, selected, locale);
  repo.insertAssessment({
    projectId: p.id, methodologyVersion: result.methodologyVersion, inputSnapshot: input, results: result,
    analysis: { lang: analysis.lang, criteria: analysis.criteria }, aiMeta: { ...analysis.meta, modeReason: "demo seed" },
    locale, createdBy: DEMO_USER_ID,
    recommendations: analysis.recommendations.map((r) => ({ rec_key: r.key, criterion: r.criterion, dimension: r.dimension, priority: r.priority, content: r })),
  });
}

const noFile = { file_name: null, file_path: null, file_mime: null, file_size: null };

/** Idempotent: does nothing if the demo account already exists. Returns true when data was created. */
export function seedDemoData(): boolean {
  if (repo.findUserByEmail(DEMO_EMAIL)) return false;
  repo.createUser(DEMO_EMAIL, "Demo Founder", hashPassword(DEMO_PASSWORD), "ar", DEMO_USER_ID);

  // 1) Handloom co-operative (workers model) — two versions showing progress.
  repo.createProject(DEMO_USER_ID, {
    name: "نسيج الصعيد (بيانات تجريبية)", description: "Dummy project: women-run handloom co-operative selling scarves.",
    country: "Egypt", area: "Assiut", beneficiaryModel: "workers", grantsCoverCosts: true,
  }, P1);
  repo.saveDraftAnswers(P1, {
    ...base(), "C1-Q1": 0, "C1-Q2": 2, "C1-Q3": 2, "C1-Q4": 3, "C1-EF": 1,
    "C2-Q1": 2, "C2-Q2": 2, "C2-Q3": 2, "C2-Q4": 2, "C3-Q1": 2, "C3-Q2": 2, "C3-Q3": 2, "C3-Q4": 2,
    "C4-Q1": 0, "C4-Q2": 1, "C4-Q3": 0, "C4-Q4": 1, "C5-Q1": 2, "C5-Q2": 1, "C5-Q3": 1, "C5-Q4": 2,
    "C6-Q1": 1, "C6-Q2": 1, "C6-Q3": 2, "C6-Q4": 2, "C7-Q1": 1, "C7-Q2": 4, "C7-Q3": 1, "C7-Q4": 1,
    "C8-Q1": 2, "C8-Q2": 0, "C8-Q3": 2, "C8-Q4": 2,
  });
  assessNow(P1, "ar");
  repo.addEvidence(P1, { criterion: "C2", dimension: "commercial", kind: "estimate_calculation", title: "Unit cost sheet (dummy)", description: "Cost per scarf: yarn, dye, labour hours, packaging. Method: supplier quotes + timed production of 20 scarves.", numeric_value: null, ...noFile });
  repo.addEvidence(P1, { criterion: "C1", dimension: "social", kind: "survey_interviews", title: "Interviews with 30 women (dummy)", description: "Structured interviews in 3 villages, March; sample and questions documented.", numeric_value: null, ...noFile });
  repo.saveDraftAnswers(P1, { "C2-Q1": 1, "C2-Q2": 1, "C7-Q2": 1, "C6-Q1": 5 });
  assessNow(P1, "ar");

  // 2) Learning centre (service-user model).
  repo.createProject(DEMO_USER_ID, {
    name: "Bright Steps Learning Hub (dummy)", description: "Dummy project: after-school tutoring paid by parents and schools.",
    country: "Egypt", area: "Giza", beneficiaryModel: "service_users", grantsCoverCosts: false,
  }, P2);
  repo.saveDraftAnswers(P2, {
    ...base(), "C1-Q1": 4, "C1-Q2": 3, "C1-Q3": 0, "C1-Q4": 4, "C1-EF": 2,
    "C2-Q3": 4, "C2-Q4": 4, "C3-Q1": 1, "C3-Q2": 0, "C3-Q3": 4, "C3-Q4": 4, "C4-Q3": 5, "C4-Q4": 5, "C5-Q3": 5, "C5-Q4": 5,
    "C6-Q3": 4, "C6-Q4": 4, "C7-Q3": 1, "C7-Q4": 1, "C8-Q3": 5, "C8-Q4": 5,
  });
  assessNow(P2, "en");

  // 3) Draft project (not yet assessed) with unknown answers.
  repo.createProject(DEMO_USER_ID, {
    name: "Green Crates Recycling (dummy)", description: "Dummy draft project.", country: "Egypt", area: "Alexandria",
    beneficiaryModel: "undetermined", grantsCoverCosts: false,
  }, P3);
  repo.saveDraftAnswers(P3, { "C1-Q1": 5, "C1-Q2": 5, "C1-Q3": 7 });
  return true;
}
