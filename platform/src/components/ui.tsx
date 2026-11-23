import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-surface p-5 shadow-sm ${className}`}>{children}</section>;
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{children}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  );
}

const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 min-h-10";
export const btn = {
  primary: `${btnBase} bg-brand text-white hover:brightness-110`,
  secondary: `${btnBase} border border-line bg-surface text-ink hover:bg-bg`,
  danger: `${btnBase} border border-red-300 bg-surface text-red-700 hover:bg-danger-soft`,
  link: "font-semibold text-brand underline-offset-4 hover:underline",
};

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: keyof typeof btn }) {
  return (
    <Link href={href} className={btn[variant]}>
      {children}
    </Link>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand min-h-10";

export function Notice({ kind = "info", children }: { kind?: "info" | "warn" | "error" | "success"; children: ReactNode }) {
  const cls = {
    info: "bg-brand-soft text-ink border-brand/30",
    warn: "bg-warn-soft text-warn-ink border-amber-300",
    error: "bg-danger-soft text-red-800 border-red-300",
    success: "bg-green-50 text-green-900 border-green-300",
  }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`mb-4 rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "com" | "soc" | "brand" | "warn" | "high" | "medium" | "low" }) {
  const cls = {
    neutral: "bg-bg text-muted border-line",
    com: "bg-com-soft text-com border-com/20",
    soc: "bg-soc-soft text-soc border-soc/20",
    brand: "bg-brand-soft text-brand border-brand/20",
    warn: "bg-warn-soft text-warn-ink border-amber-300",
    high: "bg-red-50 text-red-800 border-red-200",
    medium: "bg-amber-50 text-amber-900 border-amber-200",
    low: "bg-slate-50 text-slate-700 border-slate-200",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

/** Score chip: 1–5, Not Scored, or N/A — never a number for unscored states. */
export function ScoreChip({ score, status, label, size = "md" }: { score: number | null; status: string; label: string; size?: "md" | "lg" }) {
  const cls = status === "scored" ? `score-${score}` : status === "not_applicable" ? "score-na" : "score-ns";
  const dims = size === "lg" ? "h-14 min-w-14 text-xl" : "h-9 min-w-9 text-sm";
  return (
    <span className={`inline-flex items-center justify-center rounded-lg px-2 font-bold ${dims} ${cls}`} title={label} aria-label={label}>
      {status === "scored" ? score : status === "not_applicable" ? "N/A" : "—"}
    </span>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
