import "server-only";
import { getDb, newId, now, tx } from "./db";
import type { BeneficiaryModel } from "../scoring/types";
import type { EvidenceItemInput } from "../evidence/kinds";

// ---------- Types ----------
export interface UserRow { id: string; email: string; name: string; password_hash: string; locale: string; created_at: string }
export interface ProjectRow {
  id: string; owner_id: string; name: string; description: string; country: string; area: string;
  beneficiary_model: BeneficiaryModel; grants_cover_costs: number; archived: number; created_at: string; updated_at: string;
}
export interface EvidenceRow {
  id: string; project_id: string; criterion: string; dimension: "commercial" | "social"; kind: string; title: string;
  description: string; numeric_value: number | null; file_name: string | null; file_path: string | null;
  file_mime: string | null; file_size: number | null; created_at: string;
}
export interface AssessmentRow {
  id: string; project_id: string; version: number; methodology_version: string; input_snapshot: string;
  results: string; analysis: string; ai_meta: string; locale: string; created_by: string; created_at: string;
}
export interface RecommendationRow {
  id: string; assessment_id: string; project_id: string; rec_key: string; criterion: string; dimension: string;
  priority: string; content: string; status: string; status_updated_at: string | null; created_at: string;
}
export interface RecEvidenceRow {
  id: string; recommendation_id: string; note: string; file_name: string | null; file_path: string | null;
  file_mime: string | null; file_size: number | null; created_at: string;
}

const q = () => getDb();

// ---------- Users & sessions ----------
export function createUser(email: string, name: string, passwordHash: string, locale: string, fixedId?: string): UserRow {
  const row: UserRow = { id: fixedId ?? newId(), email: email.toLowerCase().trim(), name, password_hash: passwordHash, locale, created_at: now() };
  q().prepare("INSERT INTO users (id,email,name,password_hash,locale,created_at) VALUES (?,?,?,?,?,?)")
    .run(row.id, row.email, row.name, row.password_hash, row.locale, row.created_at);
  return row;
}
export const findUserByEmail = (email: string) =>
  q().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as UserRow | undefined;
export const findUserById = (id: string) => q().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
export function updateUserProfile(id: string, name: string, locale: string) {
  q().prepare("UPDATE users SET name = ?, locale = ? WHERE id = ?").run(name, locale, id);
}
export function updateUserPassword(id: string, hash: string) {
  q().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, id);
  q().prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
}

export function insertSession(tokenHash: string, userId: string, expiresAt: string) {
  q().prepare("INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)").run(tokenHash, userId, expiresAt, now());
}
export function findSession(tokenHash: string) {
  return q().prepare("SELECT * FROM sessions WHERE id = ?").get(tokenHash) as { id: string; user_id: string; expires_at: string } | undefined;
}
export const deleteSession = (tokenHash: string) => q().prepare("DELETE FROM sessions WHERE id = ?").run(tokenHash);

// ---------- Projects (all access scoped by owner — TD-04) ----------
export interface ProjectInput {
  name: string; description: string; country: string; area: string; beneficiaryModel: BeneficiaryModel; grantsCoverCosts: boolean;
}
export function createProject(ownerId: string, p: ProjectInput, fixedId?: string): ProjectRow {
  const id = fixedId ?? newId();
  const t = now();
  q().prepare(
    "INSERT INTO projects (id,owner_id,name,description,country,area,beneficiary_model,grants_cover_costs,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
  ).run(id, ownerId, p.name, p.description, p.country, p.area, p.beneficiaryModel, p.grantsCoverCosts ? 1 : 0, t, t);
  return getProjectForUser(id, ownerId)!;
}
export function updateProject(id: string, ownerId: string, p: ProjectInput) {
  q().prepare(
    "UPDATE projects SET name=?, description=?, country=?, area=?, beneficiary_model=?, grants_cover_costs=?, updated_at=? WHERE id=? AND owner_id=?",
  ).run(p.name, p.description, p.country, p.area, p.beneficiaryModel, p.grantsCoverCosts ? 1 : 0, now(), id, ownerId);
}
export const getProjectForUser = (id: string, ownerId: string) =>
  q().prepare("SELECT * FROM projects WHERE id = ? AND owner_id = ?").get(id, ownerId) as ProjectRow | undefined;
export const listProjects = (ownerId: string, archived = false) =>
  q().prepare("SELECT * FROM projects WHERE owner_id = ? AND archived = ? ORDER BY updated_at DESC").all(ownerId, archived ? 1 : 0) as unknown as ProjectRow[];
export function setArchived(id: string, ownerId: string, archived: boolean) {
  q().prepare("UPDATE projects SET archived = ?, updated_at = ? WHERE id = ? AND owner_id = ?").run(archived ? 1 : 0, now(), id, ownerId);
}
const touch = (projectId: string) => q().prepare("UPDATE projects SET updated_at = ? WHERE id = ?").run(now(), projectId);

// ---------- Draft answers ----------
export function getDraftAnswers(projectId: string): Record<string, number> {
  const rows = q().prepare("SELECT question_id, option_index FROM draft_answers WHERE project_id = ?").all(projectId) as { question_id: string; option_index: number }[];
  return Object.fromEntries(rows.map((r) => [r.question_id, r.option_index]));
}
export function saveDraftAnswers(projectId: string, answers: Record<string, number>) {
  tx(() => {
    const st = q().prepare(
      "INSERT INTO draft_answers (project_id,question_id,option_index,updated_at) VALUES (?,?,?,?) ON CONFLICT(project_id,question_id) DO UPDATE SET option_index=excluded.option_index, updated_at=excluded.updated_at",
    );
    const t = now();
    for (const [k, v] of Object.entries(answers)) st.run(projectId, k, v, t);
    touch(projectId);
  });
}

// ---------- Evidence ----------
export const listEvidence = (projectId: string) =>
  q().prepare("SELECT * FROM evidence_items WHERE project_id = ? ORDER BY created_at").all(projectId) as unknown as EvidenceRow[];
export function addEvidence(projectId: string, e: Omit<EvidenceRow, "id" | "project_id" | "created_at">): EvidenceRow {
  const id = newId();
  q().prepare(
    "INSERT INTO evidence_items (id,project_id,criterion,dimension,kind,title,description,numeric_value,file_name,file_path,file_mime,file_size,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(id, projectId, e.criterion, e.dimension, e.kind, e.title, e.description, e.numeric_value, e.file_name, e.file_path, e.file_mime, e.file_size, now());
  touch(projectId);
  return q().prepare("SELECT * FROM evidence_items WHERE id = ?").get(id) as unknown as EvidenceRow;
}
export function deleteEvidence(projectId: string, evidenceId: string) {
  // Removes it from the working draft only; submitted assessments keep their own snapshot.
  q().prepare("DELETE FROM evidence_items WHERE id = ? AND project_id = ?").run(evidenceId, projectId);
  touch(projectId);
}
export const getEvidence = (projectId: string, evidenceId: string) =>
  q().prepare("SELECT * FROM evidence_items WHERE id = ? AND project_id = ?").get(evidenceId, projectId) as EvidenceRow | undefined;
export function evidenceToInput(rows: EvidenceRow[]): EvidenceItemInput[] {
  return rows.map((r) => ({
    id: r.id, criterion: r.criterion, dimension: r.dimension, kind: r.kind, title: r.title, description: r.description,
    numericValue: r.numeric_value, hasFile: !!r.file_path,
  }));
}

// ---------- Assessments (insert-only) ----------
export const listAssessments = (projectId: string) =>
  q().prepare("SELECT * FROM assessments WHERE project_id = ? ORDER BY version").all(projectId) as unknown as AssessmentRow[];
export const getAssessment = (projectId: string, version: number) =>
  q().prepare("SELECT * FROM assessments WHERE project_id = ? AND version = ?").get(projectId, version) as AssessmentRow | undefined;
export const latestAssessment = (projectId: string) =>
  q().prepare("SELECT * FROM assessments WHERE project_id = ? ORDER BY version DESC LIMIT 1").get(projectId) as AssessmentRow | undefined;

export interface NewRecommendation { rec_key: string; criterion: string; dimension: string; priority: string; content: unknown }

export function insertAssessment(a: {
  projectId: string; methodologyVersion: string; inputSnapshot: unknown; results: unknown; analysis: unknown; aiMeta: unknown;
  locale: string; createdBy: string; recommendations: NewRecommendation[];
}): AssessmentRow {
  return tx(() => {
    const v = (q().prepare("SELECT COALESCE(MAX(version),0) AS v FROM assessments WHERE project_id = ?").get(a.projectId) as { v: number }).v + 1;
    const id = newId();
    const t = now();
    q().prepare(
      "INSERT INTO assessments (id,project_id,version,methodology_version,input_snapshot,results,analysis,ai_meta,locale,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ).run(id, a.projectId, v, a.methodologyVersion, JSON.stringify(a.inputSnapshot), JSON.stringify(a.results), JSON.stringify(a.analysis), JSON.stringify(a.aiMeta), a.locale, a.createdBy, t);
    const st = q().prepare(
      "INSERT INTO recommendations (id,assessment_id,project_id,rec_key,criterion,dimension,priority,content,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    );
    for (const r of a.recommendations) st.run(newId(), id, a.projectId, r.rec_key, r.criterion, r.dimension, r.priority, JSON.stringify(r.content), "not_started", t);
    touch(a.projectId);
    return q().prepare("SELECT * FROM assessments WHERE id = ?").get(id) as unknown as AssessmentRow;
  });
}

// ---------- Recommendations ----------
export const listRecommendations = (assessmentId: string) =>
  q().prepare("SELECT * FROM recommendations WHERE assessment_id = ? ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, criterion").all(assessmentId) as unknown as RecommendationRow[];
export const getRecommendation = (projectId: string, recId: string) =>
  q().prepare("SELECT * FROM recommendations WHERE id = ? AND project_id = ?").get(recId, projectId) as RecommendationRow | undefined;
/** Status only — never touches scores (D-14). */
export function setRecommendationStatus(projectId: string, recId: string, status: string) {
  q().prepare("UPDATE recommendations SET status = ?, status_updated_at = ? WHERE id = ? AND project_id = ?").run(status, now(), recId, projectId);
}
export function addRecommendationEvidence(recId: string, e: Omit<RecEvidenceRow, "id" | "recommendation_id" | "created_at">) {
  q().prepare(
    "INSERT INTO recommendation_evidence (id,recommendation_id,note,file_name,file_path,file_mime,file_size,created_at) VALUES (?,?,?,?,?,?,?,?)",
  ).run(newId(), recId, e.note, e.file_name, e.file_path, e.file_mime, e.file_size, now());
}
export const listRecommendationEvidence = (recId: string) =>
  q().prepare("SELECT * FROM recommendation_evidence WHERE recommendation_id = ? ORDER BY created_at").all(recId) as unknown as RecEvidenceRow[];
export const getRecommendationEvidence = (recId: string, id: string) =>
  q().prepare("SELECT * FROM recommendation_evidence WHERE id = ? AND recommendation_id = ?").get(id, recId) as RecEvidenceRow | undefined;

// ---------- AI run log (token / cost monitoring) ----------
export function logAiRun(r: {
  projectId: string; criterion: string; provider: string; model: string; promptVersion: string; status: string;
  attempts: number; inputTokens?: number; outputTokens?: number; latencyMs?: number; error?: string;
}) {
  q().prepare(
    "INSERT INTO ai_runs (id,project_id,criterion,provider,model,prompt_version,status,attempts,input_tokens,output_tokens,latency_ms,error,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(newId(), r.projectId, r.criterion, r.provider, r.model, r.promptVersion, r.status, r.attempts, r.inputTokens ?? null, r.outputTokens ?? null, r.latencyMs ?? null, r.error ?? null, now());
}
