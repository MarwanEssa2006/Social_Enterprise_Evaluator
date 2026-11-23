"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/session";

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 min-h-10";
const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand min-h-10";

export function Submit({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={btnPrimary} disabled={pending} aria-busy={pending}>
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />}
      {pending && pendingLabel ? pendingLabel : label}
    </button>
  );
}

type Action = (s: FormState, f: FormData) => Promise<FormState>;

function Messages({ state, errors, ok }: { state: FormState; errors: Record<string, string>; ok?: string }) {
  if (state?.error) return <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-danger-soft px-4 py-3 text-sm text-red-800">{errors[state.error] ?? errors.default}</p>;
  if (state?.ok && ok) return <p role="status" className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">{ok}</p>;
  return null;
}

export function AuthForm({ action, mode, t }: { action: Action; mode: "login" | "register"; t: Record<string, string> }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} noValidate={false}>
      <Messages state={state} errors={{ invalid: t.errInvalid, throttled: t.errThrottled, exists: t.errExists, validation: t.errValidation, default: t.errValidation }} />
      {mode === "register" && (
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">{t.name}</label>
          <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" className={input} />
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">{t.email}</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} dir="ltr" />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">{t.password}</label>
        <input id="password" name="password" type="password" required minLength={mode === "register" ? 10 : 1} autoComplete={mode === "register" ? "new-password" : "current-password"} className={input} dir="ltr" />
        {mode === "register" && <p className="mt-1 text-xs text-muted">{t.passwordHint}</p>}
      </div>
      <Submit label={mode === "register" ? t.submitRegister : t.submitLogin} />
    </form>
  );
}

export function ActionForm({
  action, children, submitLabel, pendingLabel, errors, ok, className, encType,
}: {
  action: Action; children: React.ReactNode; submitLabel: string; pendingLabel?: string; errors: Record<string, string>; ok?: string; className?: string; encType?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className} {...(encType ? { encType: "multipart/form-data" } : {})}>
      <Messages state={state} errors={errors} ok={ok} />
      {children}
      <Submit label={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}

/** Evidence kind select that reveals the number field only for population statistics. */
export function EvidenceKindSelect({ kinds, label, numberLabel }: { kinds: { id: string; label: string }[]; label: string; numberLabel: string }) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="kind" className="mb-1 block text-sm font-semibold">{label}</label>
        <select
          id="kind" name="kind" required className={input}
          onChange={(e) => {
            const el = e.currentTarget.form?.querySelector<HTMLDivElement>("[data-number]");
            if (el) el.hidden = e.currentTarget.value !== "population_statistic";
          }}
        >
          {kinds.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
      </div>
      <div className="mb-3" data-number hidden>
        <label htmlFor="numericValue" className="mb-1 block text-sm font-semibold">{numberLabel}</label>
        <input id="numericValue" name="numericValue" type="number" min={1} step={1} className={input} dir="ltr" />
      </div>
    </>
  );
}
