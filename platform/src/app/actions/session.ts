"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/server/passwords";
import { createUser, findUserByEmail, updateUserPassword, updateUserProfile } from "@/lib/server/repo";
import { clearLoginFailures, endSession, loginAllowed, recordLoginFailure, requireUser, startSession } from "@/lib/server/auth";
import { LOCALE_COOKIE, getLocale } from "@/lib/i18n/server";

export type FormState = { error?: string; ok?: string } | undefined;

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  password: z.string().min(10).max(200),
});

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "validation" };
  if (findUserByEmail(parsed.data.email)) return { error: "exists" };
  const user = createUser(parsed.data.email, parsed.data.name, hashPassword(parsed.data.password), await getLocale());
  await startSession(user.id);
  redirect("/dashboard");
}

const LoginSchema = z.object({ email: z.string().trim().max(200), password: z.string().max(200) });

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const email = parsed.data.email.toLowerCase();
  if (!loginAllowed(email)) return { error: "throttled" };
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    recordLoginFailure(email);
    return { error: "invalid" };
  }
  clearLoginFailures(email);
  await startSession(user.id);
  (await cookies()).set(LOCALE_COOKIE, user.locale === "en" ? "en" : "ar", { path: "/", sameSite: "lax", maxAge: 31536000 });
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}

export async function switchLocaleAction(form: FormData) {
  const next = form.get("locale") === "en" ? "en" : "ar";
  (await cookies()).set(LOCALE_COOKIE, next, { path: "/", sameSite: "lax", maxAge: 31536000 });
  const back = String(form.get("back") || "/");
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/");
}

const ProfileSchema = z.object({ name: z.string().trim().min(2).max(100), locale: z.enum(["ar", "en"]) });

export async function updateProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "validation" };
  updateUserProfile(user.id, parsed.data.name, parsed.data.locale);
  (await cookies()).set(LOCALE_COOKIE, parsed.data.locale, { path: "/", sameSite: "lax", maxAge: 31536000 });
  return { ok: "saved" };
}

const PasswordSchema = z.object({ current: z.string().max(200), next: z.string().min(10).max(200) });

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = PasswordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "validation" };
  if (!verifyPassword(parsed.data.current, user.password_hash)) return { error: "current" };
  updateUserPassword(user.id, hashPassword(parsed.data.next)); // also ends all sessions
  await startSession(user.id);
  return { ok: "saved" };
}
