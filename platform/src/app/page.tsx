import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/auth";
import { ButtonLink, Card } from "@/components/ui";
import { CRITERIA } from "@/lib/questions/criteria";

export default async function Landing() {
  if (await currentUser()) redirect("/dashboard");
  const { t, locale } = await getDict();
  const L = t.landing;
  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-brand to-[#0b4f45] px-6 py-12 text-white sm:px-10 sm:py-16">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{L.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{L.heroBody}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/register" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2 font-semibold text-brand hover:bg-white/90">{L.cta}</a>
          <a href="/login" className="inline-flex min-h-11 items-center rounded-lg border border-white/60 px-5 py-2 font-semibold text-white hover:bg-white/10">{L.haveAccount}</a>
        </div>
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[[L.p1t, L.p1b], [L.p2t, L.p2b], [L.p3t, L.p3b], [L.p4t, L.p4b]].map(([title, body]) => (
          <Card key={title}>
            <h2 className="font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <h2 className="mb-3 font-bold">{locale === "ar" ? "المعايير الثمانية لنموذج آلان للنجاح" : "The eight criteria of Alan's List of Success"}</h2>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CRITERIA.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
              {locale === "ar" ? c.nameAr : c.nameEn}
            </li>
          ))}
        </ol>
      </Card>
      <div className="mt-8 text-center">
        <ButtonLink href="/register">{L.cta}</ButtonLink>
      </div>
    </div>
  );
}
