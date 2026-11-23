import { getAssessment, listRecommendations } from "@/lib/server/repo";
import { notFoundResponse, projectForRoute } from "@/lib/server/route-auth";
import { recContent, viewAssessment } from "@/lib/server/views";
import { reportHtml } from "@/lib/exports/report-html";
import { htmlToPdf } from "@/lib/exports/pdf";
import { downloadResponse } from "@/lib/server/files";
import { getLocale } from "@/lib/i18n/server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; v: string }> }) {
  const { id, v } = await ctx.params;
  const auth = await projectForRoute(id);
  if (!auth) return notFoundResponse();
  const row = getAssessment(auth.project.id, Number(v));
  if (!row) return notFoundResponse();
  const a = viewAssessment(row);
  const locale = await getLocale();
  const html = reportHtml(
    {
      project: { name: auth.project.name, description: auth.project.description, country: a.input.context.country, area: a.input.context.area, beneficiaryModel: a.input.context.beneficiaryModel, grantsCoverCosts: a.input.context.grantsCoverCosts },
      version: row.version, methodology: row.methodology_version, createdAt: row.created_at, result: a.result, answers: a.input.answers,
      analysis: a.analysis, recommendations: listRecommendations(row.id).map((r) => ({ priority: r.priority, status: r.status, content: recContent(r) })),
    },
    locale,
  );
  const pdf = await htmlToPdf(html);
  return downloadResponse(pdf, `assessment-v${row.version}.pdf`, "application/pdf");
}
