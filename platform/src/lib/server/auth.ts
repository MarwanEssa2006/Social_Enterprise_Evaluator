import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashToken, newSessionToken } from "./passwords";
import { deleteSession, findSession, findUserById, getProjectForUser, insertSession, type ProjectRow, type UserRow } from "./repo";
import { notFound } from "next/navigation";

export const SESSION_COOKIE = "sev_session";
const SESSION_DAYS = 30;

export async function startSession(userId: string) {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  insertSession(hashToken(token), userId, expires.toISOString());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(hashToken(token));
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<UserRow | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = findSession(hashToken(token));
  if (!s) return null;
  if (new Date(s.expires_at).getTime() < Date.now()) {
    deleteSession(s.id);
    return null;
  }
  return findUserById(s.user_id) ?? null;
}

export async function requireUser(): Promise<UserRow> {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}

/** Authorisation guard: another user's project is indistinguishable from a missing one (TD-04). */
export async function requireProject(projectId: string): Promise<{ user: UserRow; project: ProjectRow }> {
  const user = await requireUser();
  const project = getProjectForUser(projectId, user.id);
  if (!project) notFound();
  return { user, project };
}

// Simple in-memory login throttle (per email): 5 failures per 15 minutes.
const failures = new Map<string, { count: number; first: number }>();
export function loginAllowed(email: string): boolean {
  const f = failures.get(email);
  if (!f) return true;
  if (Date.now() - f.first > 15 * 60_000) {
    failures.delete(email);
    return true;
  }
  return f.count < 5;
}
export function recordLoginFailure(email: string) {
  const f = failures.get(email);
  if (!f || Date.now() - f.first > 15 * 60_000) failures.set(email, { count: 1, first: Date.now() });
  else f.count++;
}
export function clearLoginFailures(email: string) {
  failures.delete(email);
}
