import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { requireUser } from "@/lib/server/auth";
import { latestAssessment, listAssessments, listProjects } from "@/lib/server/repo";
import { ButtonLink, Card, PageTitle, Badge } from "@/components/ui";
import { fmtDate, viewAssessment } from "@/lib/server/views";

export const metadata = { title: "My projects" };

export default async function Dashboard() {
  const user = await requireUser();
  const { t, locale } = await getDict();
  const projects = listProjects(user.id);
  const archived = listProjects(user.id, true);
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle sub={user.name}>{t.dash.title}</PageTitle>
        <ButtonLink href="/projects/new">+ {t.dash.newProject}</ButtonLink>
      </div>
      {projects.length === 0 ? (
        <Card>
          <p className="text-muted">{t.dash.empty}</p>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const last = latestAssessment(p.id);
            const v = last ? viewAssessment(last) : null;
            const cls = v ? t.classes[v.result.classification.key][0] : null;
            return (
              <li key={p.id}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold">
                      <Link href={`/projects/${p.id}`} className="hover:underline">{p.name}</Link>
                    </h2>
                    {cls ? <Badge tone="brand">{cls}</Badge> : <Badge>{t.dash.noAssessment}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{[p.country, p.area].filter(Boolean).join(" · ")}</p>
                  {v && (
                    <div className="mt-3 flex gap-4 text-sm">
                      <span><span className="text-com font-semibold">{t.res.commercial}:</span> {v.result.commercial.display ?? t.res.notScored}</span>
                      <span><span className="text-soc font-semibold">{t.res.social}:</span> {v.result.social.display ?? t.res.notScored}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>{t.dash.versions}: {listAssessments(p.id).length}</span>
                    <span>{t.dash.lastUpdated}: {fmtDate(p.updated_at, locale)}</span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      {archived.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer font-semibold text-muted">{t.dash.archived} ({archived.length})</summary>
          <ul className="mt-3 space-y-2">
            {archived.map((p) => (
              <li key={p.id}><Link className="text-brand underline" href={`/projects/${p.id}`}>{p.name}</Link></li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
