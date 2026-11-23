"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProject, requireUser } from "@/lib/server/auth";
import * as repo from "@/lib/server/repo";
import { QUESTIONS } from "@/lib/questions/bank";
import { CRITERION_IDS } from "@/lib/questions/criteria";
import { EVIDENCE_KINDS } from "@/lib/evidence/kinds";
import { storeUpload } from "@/lib/server/files";
import { submitAssessment, SubmissionError } from "@/lib/server/assess";
import { getLocale } from "@/lib/i18n/server";
import type { FormState } from "./session";

const ProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(""),
  country: z.string().trim().max(80).default(""),
  area: z.string().trim().max(120).default(""),
  beneficiaryModel: z.enum(["workers", "service_users", "both", "undetermined"]),
  grantsCoverCosts: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

function projectFromForm(form: FormData) {
  return ProjectSchema.safeParse({
    name: form.get("name"), description: form.get("description") ?? "", country: form.get("country") ?? "",
    area: form.get("area") ?? "", beneficiaryModel: form.get("beneficiaryModel"), grantsCoverCosts: form.get("grantsCoverCosts"),
  });
}

export async function createProjectAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = projectFromForm(form);
  if (!parsed.success) return { error: "validation" };
  const p = repo.createProject(user.id, parsed.data);
  redirect(`/projects/${p.id}/questions`);
}

export async function updateProjectAction(_: FormState, form: FormData): Promise<FormState> {
  const { user, project } = await requireProject(String(form.get("projectId")));
  const parsed = projectFromForm(form);
  if (!parsed.success) return { error: "validation" };
  repo.updateProject(project.id, user.id, parsed.data);
  redirect(`/projects/${project.id}`);
}

export async function archiveProjectAction(form: FormData) {
  const { user, project } = await requireProject(String(form.get("projectId")));
  repo.setArchived(project.id, user.id, form.get("archive") === "1");
  redirect("/dashboard");
}

const VALID_OPTION: Record<string, number> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options.length]));

export async function saveAnswersAction(form: FormData) {
  const { project } = await requireProject(String(form.get("projectId")));
  const answers: Record<string, number> = {};
  for (const [k, v] of form.entries()) {
    if (!k.startsWith("q:")) continue;
    const qid = k.slice(2);
    const n = Number(v);
    if (VALID_OPTION[qid] !== undefined && Number.isInteger(n) && n >= 0 && n < VALID_OPTION[qid]) answers[qid] = n;
  }
  repo.saveDraftAnswers(project.id, answers);
  const next = String(form.get("next") || "");
  const current = String(form.get("current") || "C1");
  revalidatePath(`/projects/${project.id}`);
  if (next === "submit") redirect(`/projects/${project.id}/submit`);
  const target = (CRITERION_IDS as readonly string[]).includes(next) ? next : (CRITERION_IDS as readonly string[]).includes(current) ? current : "C1";
  redirect(`/projects/${project.id}/questions?c=${target}&saved=1`);
}

const EvidenceSchema = z.object({
  criterion: z.enum(CRITERION_IDS as unknown as [string, ...string[]]),
  dimension: z.enum(["commercial", "social"]),
  kind: z.enum(EVIDENCE_KINDS.map((k) => k.id) as [string, ...string[]]),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).default(""),
  numericValue: z.preprocess((v) => (v === "" || v === null ? null : Number(v)), z.number().positive().max(2_000_000_000).nullable()),
});

export async function addEvidenceAction(_: FormState, form: FormData): Promise<FormState> {
  const { project } = await requireProject(String(form.get("projectId")));
  const parsed = EvidenceSchema.safeParse({
    criterion: form.get("criterion"), dimension: form.get("dimension"), kind: form.get("kind"), title: form.get("title"),
    description: form.get("description") ?? "", numericValue: form.get("numericValue") ?? "",
  });
  if (!parsed.success) return { error: "validation" };
  const stored = await storeUpload(form.get("file") as File | null);
  if (stored === "invalid") return { error: "file" };
  repo.addEvidence(project.id, {
    criterion: parsed.data.criterion, dimension: parsed.data.dimension, kind: parsed.data.kind, title: parsed.data.title,
    description: parsed.data.description, numeric_value: parsed.data.kind === "population_statistic" ? parsed.data.numericValue : null,
    file_name: stored?.file_name ?? null, file_path: stored?.file_path ?? null, file_mime: stored?.file_mime ?? null, file_size: stored?.file_size ?? null,
  });
  revalidatePath(`/projects/${project.id}/questions`);
  return { ok: "added" };
}

export async function deleteEvidenceAction(form: FormData) {
  const { project } = await requireProject(String(form.get("projectId")));
  repo.deleteEvidence(project.id, String(form.get("evidenceId")));
  redirect(`/projects/${project.id}/questions?c=${String(form.get("current") || "C1")}`);
}

export async function submitAssessmentAction(_: FormState, form: FormData): Promise<FormState> {
  const { user, project } = await requireProject(String(form.get("projectId")));
  let version: number;
  try {
    const row = await submitAssessment(project, user.id, await getLocale());
    version = row.version;
  } catch (e) {
    if (e instanceof SubmissionError) return { error: "missing" };
    console.error("assessment failed", e instanceof Error ? e.message : e);
    return { error: "failed" };
  }
  redirect(`/projects/${project.id}/assessments/${version}`);
}

const StatusSchema = z.enum(["not_started", "in_progress", "completed"]);

export async function setRecommendationStatusAction(form: FormData) {
  const { project } = await requireProject(String(form.get("projectId")));
  const status = StatusSchema.safeParse(form.get("status"));
  const rec = repo.getRecommendation(project.id, String(form.get("recId")));
  if (status.success && rec) repo.setRecommendationStatus(project.id, rec.id, status.data); // never touches scores (D-14)
  redirect(`/projects/${project.id}/recommendations#${rec?.id ?? ""}`);
}

export async function addRecommendationEvidenceAction(_: FormState, form: FormData): Promise<FormState> {
  const { project } = await requireProject(String(form.get("projectId")));
  const rec = repo.getRecommendation(project.id, String(form.get("recId")));
  const note = String(form.get("note") ?? "").trim();
  if (!rec || note.length < 2 || note.length > 2000) return { error: "validation" };
  const stored = await storeUpload(form.get("file") as File | null);
  if (stored === "invalid") return { error: "file" };
  repo.addRecommendationEvidence(rec.id, { note, file_name: stored?.file_name ?? null, file_path: stored?.file_path ?? null, file_mime: stored?.file_mime ?? null, file_size: stored?.file_size ?? null });
  revalidatePath(`/projects/${project.id}/recommendations`);
  return { ok: "saved" };
}
