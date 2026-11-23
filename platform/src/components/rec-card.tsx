import type { Dict, Locale } from "@/lib/i18n/dict";
import type { FinalRecommendation } from "@/lib/ai/pipeline";
import { recText } from "@/lib/server/views";
import { FLAG_TEXT } from "@/lib/ai/flags";
import type { FlagKey } from "@/lib/scoring/types";
import { Badge } from "./ui";

export function RecommendationBody({ t, c, locale, priority }: { t: Dict; c: FinalRecommendation; locale: Locale; priority: string }) {
  const x = recText(c, locale);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={priority as "high"}>{t.res.priority}: {t.priority[priority as "high"]}</Badge>
        <Badge tone={c.dimension === "commercial" ? "com" : "soc"}>{t.dims[c.dimension]}</Badge>
        <Badge>{c.criterion}</Badge>
      </div>
      <h3 className="mt-2 text-base font-bold">{x.title}</h3>
      <dl className="mt-2 space-y-2 text-sm">
        <div><dt className="font-semibold text-muted">{locale === "ar" ? "نقطة الضعف أو المعلومة الناقصة" : "Weakness or missing information"}</dt><dd>{x.weakness}</dd></div>
        <div><dt className="font-semibold text-muted">{t.res.why}</dt><dd>{x.why}</dd></div>
        <div><dt className="font-semibold text-muted">{t.res.action}</dt><dd>{x.action}</dd></div>
        <div><dt className="font-semibold text-muted">{t.res.steps}</dt><dd><ol className="list-decimal ps-5">{x.steps.map((s) => <li key={s}>{s}</li>)}</ol></dd></div>
        <div><dt className="font-semibold text-muted">{t.res.evidenceNeeded}</dt><dd><ul className="list-disc ps-5">{x.evidence.map((s) => <li key={s}>{s}</li>)}</ul></dd></div>
        <div><dt className="font-semibold text-muted">{t.res.related}</dt><dd className="text-xs" dir="ltr">{[...c.relatedQuestions, ...c.relatedFlags.map((f) => FLAG_TEXT[f as FlagKey]?.[locale] ?? f)].join(" · ")}</dd></div>
      </dl>
    </div>
  );
}
