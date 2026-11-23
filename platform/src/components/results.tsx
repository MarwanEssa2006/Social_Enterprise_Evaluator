import type { Dict, Locale } from "@/lib/i18n/dict";
import type { AssessmentResult, DimensionOverall, DimensionResult } from "@/lib/scoring/types";
import { Badge, ScoreChip } from "./ui";

export function dimLabel(t: Dict, d: DimensionResult) {
  if (d.status === "not_applicable") return `${t.res.na} — ${t.notScoredReasons.service_user_model}`;
  if (d.status === "not_scored") return `${t.res.notScored} — ${t.notScoredReasons[(d.reason ?? "unknown") as keyof Dict["notScoredReasons"]] ?? d.reason}`;
  return `${d.score} — ${t.readings[d.reading]}`;
}

export function DimCell({ t, d }: { t: Dict; d: DimensionResult }) {
  return (
    <div className="flex items-center gap-2">
      <ScoreChip score={d.score} status={d.status} label={dimLabel(t, d)} />
      <span className="text-xs text-muted">
        {d.status === "scored" ? t.readings[d.reading] : d.status === "not_applicable" ? t.res.na : `${t.res.notScored}: ${t.notScoredReasons[(d.reason ?? "unknown") as keyof Dict["notScoredReasons"]] ?? ""}`}
      </span>
    </div>
  );
}

export function qualifierText(t: Dict, q: string): string | null {
  const [k, v] = q.split(":");
  if (k === "confidence" || k === "methodology") return null;
  if (k === "unresolved_conflicts" || k === "not_scored") return `${t.qualifiers[k]}: ${v}`;
  return t.qualifiers[k as keyof Dict["qualifiers"]] ?? q;
}

export function OverallPanel({ t, o, dim }: { t: Dict; o: DimensionOverall; dim: "commercial" | "social" }) {
  const tone = dim === "commercial" ? "text-com bg-com-soft" : "text-soc bg-soc-soft";
  return (
    <div className={`rounded-xl p-4 ${dim === "commercial" ? "bg-com-soft" : "bg-soc-soft"}`}>
      <div className={`text-sm font-bold ${tone.split(" ")[0]}`}>{dim === "commercial" ? t.res.commercial : t.res.social}</div>
      <div className="mt-1 text-4xl font-bold">{o.display ?? "—"}<span className="text-base font-normal text-muted">{o.display ? " / 5" : ""}</span></div>
      {!o.shown && <div className="text-sm font-semibold text-warn-ink">{t.res.notScoredOverall}</div>}
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted">{t.res.level}</dt><dd className="font-semibold">{t.levels[o.level]}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted">{t.res.criteriaMet}</dt><dd className="font-semibold">{o.criteriaMet} {t.common.of} {o.scored}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted">{t.res.coverage}</dt>
          <dd className="font-semibold">{o.scored} {t.common.of} {o.applicable} {t.res.scored}{o.distribution.na ? ` · ${o.distribution.na} ${t.res.na}` : ""}{o.distribution.notScored ? ` · ${o.distribution.notScored} ${t.res.notScored}` : ""}</dd></div>
      </dl>
      {t.levelReasons[o.levelReason as keyof Dict["levelReasons"]] && <p className="mt-2 text-xs text-muted">{t.levelReasons[o.levelReason as keyof Dict["levelReasons"]]}</p>}
    </div>
  );
}

export function ClassificationBanner({ t, r }: { t: Dict; r: AssessmentResult; locale: Locale }) {
  const [label, desc] = t.classes[r.classification.key];
  const qs = r.classification.qualifiers.map((q) => qualifierText(t, q)).filter(Boolean) as string[];
  const tone = r.classification.key === "balanced_strong" ? "border-green-300 bg-green-50" : r.classification.key === "not_classified" ? "border-line bg-bg" : r.classification.key === "balanced_developing" ? "border-brand/30 bg-brand-soft" : "border-amber-300 bg-warn-soft";
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="text-sm text-muted">{t.res.classification}</div>
      <div className="text-2xl font-bold">{label}</div>
      <p className="mt-1 text-sm">{desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="brand">{t.res.confidence}: {t.confidence[r.confidence.overall]}</Badge>
        {qs.map((q) => <Badge key={q} tone="warn">{q}</Badge>)}
      </div>
    </div>
  );
}
